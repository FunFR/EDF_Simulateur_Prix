// Export de la courbe de charge Linky (pas 30 min) depuis l'espace client Enedis.
//
// À COLLER DANS LA CONSOLE (F12) D'UN ONGLET DU PORTAIL CLIENT
// https://mon-compte-particulier.enedis.fr OÙ VOUS ÊTES CONNECTÉ (n'importe
// quelle page de votre espace ; les pages API alex.microapplications.enedis.fr
// ont une CSP qui bloque les requêtes lancées depuis leur console).
// Le script n'échange qu'avec enedis.fr (vos cookies de session servent
// d'authentification) et télécharge un fichier conso-courbe-30min_… .csv à
// glisser dans le simulateur.
//
// L'API appelée est l'API privée du portail Enedis : non contractuelle, elle
// peut changer sans préavis. En cas d'échec, ouvrez une issue sur
// https://github.com/JC144/EDF_Simulateur_Prix avec le message d'erreur.
(function () {
    'use strict';

    const CONFIG = {
        prm: "__PRM__",           // remplacé par le simulateur, sinon demandé via prompt()
        windowDays: 7,            // fenêtre par requête (l'API limite la taille des plages)
        maxMonths: 25,            // butée dure : ~24 mois d'historique + marge
        delayMs: 1000,            // délai entre requêtes (anti rate-limit)
        maxConsecutiveEmpty: 3,   // N fenêtres vides consécutives = fin d'historique
        // "fin" si l'API horodate en fin de pas, "debut" pour décaler de +30 min
        // vers la convention fin de pas attendue par le simulateur.
        horodateMode: "fin",
        base: "https://alex.microapplications.enedis.fr"
    };

    // ------------------------------------------------------------------
    // Fonctions pures (couvertes par tests/unit/enedisSnippet.test.mjs)
    // ------------------------------------------------------------------

    function pad(n) { return String(n).padStart(2, "0"); }

    function fmtDate(d) {
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    }

    // Fenêtres [debut, fin] de la plus récente à la plus ancienne, en remontant
    // depuis `today` jusqu'à maxMonths mois en arrière. L'API renvoie un 500 si
    // la plage dépasse 7 jours INCLUSIFS : le span est donc de windowDays
    // exactement (debut = fin - (windowDays - 1)), avec un chevauchement d'un
    // jour entre fenêtres consécutives (absorbé par mergePoints).
    function buildWindows(today, windowDays, maxMonths) {
        const windows = [];
        const limit = new Date(today.getFullYear(), today.getMonth() - maxMonths, today.getDate());
        let fin = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        while (fin > limit) {
            let debut = new Date(fin.getFullYear(), fin.getMonth(), fin.getDate() - (windowDays - 1));
            if (debut < limit) debut = limit;
            windows.push({ debut: fmtDate(debut), fin: fmtDate(fin) });
            fin = debut;
        }
        return windows;
    }

    // Identifiant interne de la personne dans la réponse userinfos. La forme
    // exacte n'étant pas contractuelle, on tente des chemins connus puis un
    // parcours récursif sur les noms de clés plausibles.
    function extractIdPersonne(json) {
        const candidates = [
            j => j.idPersonne,
            j => j.userId,
            j => j.internId,
            j => j.cnAlex,
            j => j.userInfos && j.userInfos.cnAlex,
            j => j.userInfos && j.userInfos.internId,
            j => j.userProperties && j.userProperties.internId
        ];
        for (const get of candidates) {
            try {
                const v = get(json);
                if (typeof v === "string" && v.trim() !== "") return v.trim();
                if (typeof v === "number") return String(v);
            } catch (e) { /* chemin absent */ }
        }
        // Filet de sécurité : première valeur scalaire dont la clé évoque
        // l'identifiant de personne.
        let found = null;
        (function walk(node) {
            if (found !== null || node === null || typeof node !== "object") return;
            for (const [key, value] of Object.entries(node)) {
                if (found !== null) return;
                if (/personne|intern|userid|cnalex/i.test(key)
                    && (typeof value === "string" || typeof value === "number")
                    && String(value).trim() !== "") {
                    found = String(value).trim();
                    return;
                }
                walk(value);
            }
        })(json);
        return found;
    }

    const ISO_RE = /^\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2})?/;

    function toNumber(v) {
        if (typeof v === "number") return v;
        if (typeof v === "string" && v.trim() !== "" && !isNaN(Number(v.replace(",", ".")))) {
            return Number(v.replace(",", "."));
        }
        return null;
    }

    // Facteur de conversion vers des W moyens sur un pas de 30 min.
    function unitFactor(unit) {
        switch (String(unit || "W").trim().toUpperCase()) {
            case "KW": return 1000;
            case "WH": return 2;      // Wh sur 30 min -> W moyens
            case "KWH": return 2000;
            case "VA": case "W": default: return 1;
        }
    }

    // Points {horodate, watt} depuis la réponse COURBE. Parcours défensif :
    // premier tableau d'objets portant à la fois un champ date ISO et un champ
    // numérique. L'unité est cherchée sur les objets englobants (clé unite/unit).
    function extractPoints(json) {
        const isUnitKey = key => /^unit(e|é)?s?$/i.test(key);

        // Un objet est un "point" s'il porte un horodatage ISO et une valeur numérique.
        function parsePoint(item, unit) {
            if (item === null || typeof item !== "object" || Array.isArray(item)) return null;
            let horodate = null, watt = null, itemUnit = unit;
            for (const [key, value] of Object.entries(item)) {
                if (horodate === null && typeof value === "string" && ISO_RE.test(value)
                    && /date|horodate|periode/i.test(key)) {
                    horodate = value;
                } else if (isUnitKey(key) && typeof value === "string") {
                    itemUnit = value;
                } else if (watt === null && /valeur|value|puissance|conso/i.test(key)) {
                    watt = toNumber(value);
                }
            }
            // Repêchage : n'importe quel champ ISO / numérique si rien de nommé.
            if (horodate === null) {
                for (const value of Object.values(item)) {
                    if (typeof value === "string" && ISO_RE.test(value)) { horodate = value; break; }
                }
            }
            if (watt === null) {
                for (const [key, value] of Object.entries(item)) {
                    const n = toNumber(value);
                    if (n !== null && !(typeof value === "string" && ISO_RE.test(value))
                        && !/id|prm/i.test(key)) { watt = n; break; }
                }
            }
            if (horodate === null || watt === null) return null;
            return { horodate, watt: watt * unitFactor(itemUnit) };
        }

        let best = null;
        (function walk(node, unit) {
            if (best !== null || node === null || typeof node !== "object") return;
            if (Array.isArray(node)) {
                const points = node.map(item => parsePoint(item, unit));
                if (node.length > 0 && points.every(p => p !== null)) {
                    best = points;
                    return;
                }
                // Pas un tableau de points : les enfants peuvent en contenir.
                for (const item of node) {
                    walk(item, unit);
                    if (best !== null) return;
                }
                return;
            }
            // L'unité déclarée en clé sœur s'applique à tous les enfants.
            let scopeUnit = unit;
            for (const [key, value] of Object.entries(node)) {
                if (isUnitKey(key) && typeof value === "string") scopeUnit = value;
            }
            for (const value of Object.values(node)) {
                walk(value, scopeUnit);
                if (best !== null) return;
            }
        })(json, null);
        return best || [];
    }

    // Horodate ISO -> clé locale normalisée "YYYY-MM-DDTHH:MM:00" (fuseau ignoré :
    // l'API du portail renvoie l'heure locale française).
    function normalizeHorodate(horodate) {
        const m = String(horodate).match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
        if (!m) return null;
        return `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:00`;
    }

    // Fusion dans une Map horodate -> W (absorbe les chevauchements de fenêtres).
    function mergePoints(map, points) {
        let added = 0;
        for (const p of points) {
            const key = normalizeHorodate(p.horodate);
            if (key !== null && !map.has(key)) {
                map.set(key, p.watt);
                added++;
            }
        }
        return added;
    }

    function shiftMinutes(key, minutes) {
        const [datePart, timePart] = key.split("T");
        const [y, mo, d] = datePart.split("-").map(Number);
        const [h, mi] = timePart.split(":").map(Number);
        const date = new Date(y, mo - 1, d, h, mi + minutes);
        return `${fmtDate(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
    }

    // CSV final : tri chronologique croissant, W entiers, horodatage fin de pas.
    function buildCsv(map, prm, horodateMode) {
        const shift = horodateMode === "debut" ? 30 : 0;
        const rows = [...map.entries()]
            .map(([key, watt]) => [shift === 0 ? key : shiftMinutes(key, shift), Math.round(watt)])
            .sort((a, b) => a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0);
        const compactDay = key => key.slice(0, 10).replace(/-/g, "");
        const filename = `conso-courbe-30min_${prm}_`
            + `${compactDay(rows[0][0])}-${compactDay(rows[rows.length - 1][0])}.csv`;
        const text = [
            `Courbe de charge Linky (pas 30 min) - PRM ${prm}`,
            "Horodate fin de pas;Puissance moyenne (W)",
            ...rows.map(([key, watt]) => `${key};${watt}`)
        ].join("\n") + "\n";
        return { filename, text };
    }

    // ------------------------------------------------------------------
    // Crochet de test : expose les fonctions pures sans lancer main()
    // ------------------------------------------------------------------
    if (globalThis.__ENEDIS_EXPORT_TEST__) {
        globalThis.__ENEDIS_EXPORT_TEST__.api = {
            buildWindows, extractIdPersonne, extractPoints,
            normalizeHorodate, mergePoints, buildCsv, unitFactor
        };
        return;
    }

    // ------------------------------------------------------------------
    // Effets : overlay, réseau, boucle principale
    // ------------------------------------------------------------------

    class FatalError extends Error { }
    class RetryableError extends Error { }
    class ChunkError extends Error { }

    const overlay = (function () {
        const div = document.createElement("div");
        div.style.cssText = "position:fixed;bottom:16px;right:16px;z-index:99999;"
            + "max-width:340px;padding:12px 16px;border-radius:8px;font:13px/1.5 sans-serif;"
            + "background:#1d3557;color:#fff;box-shadow:0 2px 12px rgba(0,0,0,.4);white-space:pre-line;";
        document.body.appendChild(div);
        return {
            info: msg => { div.style.background = "#1d3557"; div.textContent = "Export Enedis\n" + msg; },
            success: msg => { div.style.background = "#2d6a4f"; div.textContent = "Export Enedis — terminé\n" + msg; },
            error: msg => { div.style.background = "#9d0208"; div.textContent = "Export Enedis — échec\n" + msg; }
        };
    })();

    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

    const USERINFOS_URL = "https://alex.microapplications.enedis.fr/mon-compte/api/private/v2/userinfos?espace=PARTICULIER";

    async function fetchJson(url) {
        let r;
        try {
            r = await fetch(url, { credentials: "include", headers: { Accept: "application/json" } });
        } catch (e) {
            // Réponse illisible : erreur serveur sans en-tête CORS (le portail est
            // cross-origin vis-à-vis de l'API). La navigation directe n'étant
            // soumise ni à CORS ni à la CSP, ouvrir l'URL montre l'erreur réelle.
            console.warn("[export-enedis] réponse illisible pour", url, e);
            throw new ChunkError("réponse illisible (CORS). Ouvrez cette URL dans un nouvel onglet pour voir l'erreur exacte : " + url);
        }
        if (r.status === 401 || r.status === 403) {
            throw new FatalError("Session expirée ou non connecté : connectez-vous à votre espace Enedis puis relancez le script.");
        }
        if (r.status === 429) throw new RetryableError("rate-limit");
        if (!r.ok) {
            let body = "";
            try { body = (await r.text()).slice(0, 300); } catch (e) { /* corps illisible */ }
            console.warn("[export-enedis] HTTP", r.status, "pour", url, body);
            throw new ChunkError("HTTP " + r.status + (body ? " — " + body : ""));
        }
        return r.json();
    }

    async function main() {
        if (!/(^|\.)enedis\.fr$/.test(location.hostname)) {
            overlay.error("Ce script doit être exécuté dans la console d'un onglet enedis.fr (connectez-vous à votre espace particulier).");
            return;
        }
        if (location.hostname === "alex.microapplications.enedis.fr") {
            overlay.error("La CSP de cette page bloque toute requête lancée depuis sa console. Collez le script depuis un onglet de votre espace client https://mon-compte-particulier.enedis.fr (n'importe quelle page).");
            return;
        }

        let prm = CONFIG.prm;
        if (!/^\d{14}$/.test(prm)) {
            prm = (prompt("Numéro de PRM / PDL (14 chiffres, visible sur votre facture ou votre compteur Linky) :") || "").trim();
        }
        if (!/^\d{14}$/.test(prm)) {
            overlay.error("PRM invalide : 14 chiffres attendus.");
            return;
        }

        overlay.info("Identification…");
        let idPersonne;
        try {
            const userinfos = await fetchJson(USERINFOS_URL);
            idPersonne = extractIdPersonne(userinfos);
        } catch (e) {
            overlay.error(e instanceof FatalError ? e.message : "Impossible de contacter le service userinfos (" + e.message + ").");
            return;
        }
        if (!idPersonne) {
            overlay.error("Identifiant personne introuvable dans la réponse userinfos. L'API Enedis a peut-être changé : ouvrez une issue sur github.com/JC144/EDF_Simulateur_Prix.");
            return;
        }

        const windows = buildWindows(new Date(), CONFIG.windowDays, CONFIG.maxMonths);
        const map = new Map();
        let consecutiveEmpty = 0;

        for (let i = 0; i < windows.length; i++) {
            const w = windows[i];
            overlay.info(`Fenêtre ${i + 1}/${windows.length} (${w.debut} → ${w.fin})\n${map.size} points récupérés`);
            // Pas de dateFin : le paramètre déclenche un 500 (constaté en réel) ;
            // l'API renvoie d'elle-même ~7 jours de courbe à partir de dateDebut.
            const url = `${CONFIG.base}/mes-mesures-prm/api/private/v2/personnes/${idPersonne}/prms/${prm}/donnees-energetiques`
                + `?mesuresTypeCode=COURBE&mesuresCorrigees=false&typeDonnees=CONS`
                + `&dateDebut=${w.debut}&segments=C5`;
            let points = null;
            try {
                points = extractPoints(await fetchJson(url));
            } catch (e) {
                if (e instanceof FatalError) { overlay.error(e.message); return; }
                if (e instanceof RetryableError) {
                    overlay.info("Trop de requêtes, pause de 30 s…");
                    await sleep(30000);
                    try { points = extractPoints(await fetchJson(url)); } catch (e2) { points = null; }
                } else if (i === 0) {
                    overlay.error("Échec sur la période la plus récente (" + e.message + ").\n"
                        + "Vérifiez : le numéro de PRM, et que « Collecte de la consommation horaire » est activée "
                        + "sur votre espace Enedis (Gérer l'accès à mes données).");
                    return;
                }
            }
            if (points !== null && points.length > 0) {
                mergePoints(map, points);
                consecutiveEmpty = 0;
            } else {
                consecutiveEmpty++;
                if (consecutiveEmpty >= CONFIG.maxConsecutiveEmpty) break; // fin d'historique
            }
            await sleep(CONFIG.delayMs);
        }

        if (map.size === 0) {
            overlay.error("Aucune donnée récupérée. Vérifiez le PRM et que la courbe de charge est activée sur votre espace Enedis (Gérer l'accès à mes données).");
            return;
        }

        const { filename, text } = buildCsv(map, prm, CONFIG.horodateMode);
        const a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([text], { type: "text/csv" }));
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();

        const days = new Set([...map.keys()].map(k => k.slice(0, 10))).size;
        overlay.success(`${map.size} points sur ${days} jours.\nGlissez le fichier ${filename} dans le simulateur.`);
    }

    main().catch(e => {
        console.error("[export-enedis]", e);
        overlay.error("Erreur inattendue : " + e.message);
    });
})();
