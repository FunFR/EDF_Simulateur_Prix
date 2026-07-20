// Sémantique d'affichage des tarifs : traduit les clés brutes du modèle
// (types moteur "rouge", "hcEte", bandes "HP"/"hsc"...) en libellés français
// et couleurs. Présentation pure : aucun import de core/, aucun accès DOM —
// consommé par le renderer et le graphe, testable sous node.
// La structure (quel type est un jour, quelle bande par heure) vient de
// l'abonnement (champ display dérivé par defineTarif) ; ce module ne porte
// que la normalisation des noms et la palette.
// Palette validée (skill dataviz, CVD/contraste sur fond clair) : les couleurs
// sous 3:1 (aqua, ambre) sont toujours accompagnées d'un libellé visible.

const BAND_REGISTRY = {
    hp: { label: "Heures pleines", color: "#eb6834" },
    hc: { label: "Heures creuses", color: "#2a78d6" },
    hsc: { label: "Super creuses", color: "#1baf7a" },
    happy: { label: "Heures happy", color: "#4a3aa7" },
    base: { label: "Prix unique", color: "#898781" }
};

// Ordre d'affichage des colonnes/légendes : du plus cher au moins cher,
// puis les bandes spéciales.
const BAND_DISPLAY_ORDER = ["hp", "hc", "hsc", "happy", "base"];

// Noms de types de jour connus : à prix unique, leur bande se confond avec le
// jour et s'affiche « Prix unique ».
const KNOWN_DAY_KEYS = new Set([
    "bleu", "blanc", "rouge", "base", "weekend", "hiver", "ete",
    "hiverWeekend", "eteWeekend", "sobriete"
]);

const DAY_REGISTRY = {
    bleu: { label: "Bleu", color: "#256abf", ink: "#ffffff" },
    blanc: { label: "Blanc", color: "#f0efec", ink: "#0b0b0b" },
    rouge: { label: "Rouge", color: "#d03b3b", ink: "#ffffff" },
    hiver: { label: "Hiver", color: "#1c5cab", ink: "#ffffff" },
    ete: { label: "Été", color: "#eda100", ink: "#0b0b0b" },
    weekend: { label: "Week-end", color: "#1baf7a", ink: "#0b0b0b" },
    hiverWeekend: { label: "W-E hiver", color: "#1c5cab", ink: "#ffffff" },
    eteWeekend: { label: "W-E été", color: "#eda100", ink: "#0b0b0b" },
    sobriete: { label: "Sobriété", color: "#4a3aa7", ink: "#ffffff" }
};

const NEUTRAL = { color: "#898781", ink: "#ffffff" };

// "rouge HC" -> { engineType: "rouge", hc: true } — découpe sur le DERNIER
// espace : les noms de types n'en contiennent pas (contrat documenté dans
// scripts/tarifs/README.md).
export function splitHourType(hourType) {
    const cut = hourType.lastIndexOf(" ");
    return {
        engineType: hourType.slice(0, cut),
        hc: hourType.slice(cut + 1) === "HC"
    };
}

// Normalise une clé de bande brute vers un id du registre.
function normalizeBand(key) {
    if (key === "HP") return "hp";
    if (key === "HC") return "hc";
    if (/^hsc/i.test(key) || /sc$/i.test(key)) return "hsc";
    if (/^hp/.test(key)) return "hp";
    if (/^hc/.test(key)) return "hc";
    if (/happy/i.test(key)) return "happy";
    if (KNOWN_DAY_KEYS.has(key)) return "base";
    return key; // clé inconnue : conservée telle quelle (repli neutre)
}

export function bandInfo(bandKey) {
    const id = normalizeBand(bandKey);
    const known = BAND_REGISTRY[id];
    return known
        ? { id: id, label: known.label, color: known.color }
        : { id: id, label: bandKey, color: NEUTRAL.color };
}

// Badge d'un type de jour : libellé + couleur + couleur de texte.
export function dayBadge(dayKey) {
    if (dayKey === null || dayKey === undefined) {
        return null;
    }
    const known = DAY_REGISTRY[dayKey];
    if (known) {
        return { id: dayKey, label: known.label, color: known.color, ink: known.ink };
    }
    // "hcEte" -> "ete", "hscHiver" -> "hiver" : la clé de saison porte souvent
    // un préfixe de bande.
    const stripped = dayKey.replace(/^(hp|hc|hsc)/, "");
    const key = stripped.charAt(0).toLowerCase() + stripped.slice(1);
    if (key !== dayKey && DAY_REGISTRY[key]) {
        return { id: key, ...DAY_REGISTRY[key] };
    }
    return { id: dayKey, label: dayKey, color: NEUTRAL.color, ink: NEUTRAL.ink };
}

// Colonnes de bandes distinctes d'un tarif, normalisées et ordonnées.
// Un tarif à bande unique (Base) n'affiche pas de colonnes de bande.
export function bandColumns(display) {
    const ids = [];
    for (const key of display.bandOrder) {
        const id = normalizeBand(key);
        if (!ids.includes(id)) {
            ids.push(id);
        }
    }
    ids.sort((a, b) => {
        const ia = BAND_DISPLAY_ORDER.indexOf(a);
        const ib = BAND_DISPLAY_ORDER.indexOf(b);
        return (ia === -1 ? BAND_DISPLAY_ORDER.length : ia) - (ib === -1 ? BAND_DISPLAY_ORDER.length : ib);
    });
    return ids.map(id => bandInfo(id));
}

// Bande normalisée d'un relevé horaire.
export function hourBand(hourType, display) {
    const { engineType, hc } = splitHourType(hourType);
    const type = display.types[engineType];
    const bandKey = type ? type.bands[hc ? "HC" : "HP"] : engineType;
    return bandInfo(bandKey);
}

// Modèle d'affichage d'une journée : badge du jour + agrégats par bande.
// Badge pris au relevé de midi (repli : premier relevé) — les nuits à cheval
// (report de veille) gardent la couleur du jour civil, le graphe horaire
// montre le détail. Jour en erreur (aucun relevé) : ni badge ni bandes.
export function buildDayModel(day, display) {
    const hours = day.hours || [];
    if (hours.length === 0) {
        return { badge: null, byBand: {} };
    }

    let badge = null;
    if (display.dayOrder.length > 0) {
        const noon = hours.find(h => h.time.hour === 12 && h.time.minute === 0) || hours[0];
        const { engineType } = splitHourType(noon.type);
        const type = display.types[engineType];
        badge = type ? dayBadge(type.day) : null;
    }

    const byBand = {};
    for (const hour of hours) {
        const band = hourBand(hour.type, display);
        const sums = byBand[band.id] || (byBand[band.id] = { conso: 0, price: 0 });
        if (!isNaN(hour.conso)) {
            sums.conso += hour.conso;
        }
        if (!isNaN(hour.price)) {
            sums.price += hour.price;
        }
    }
    return { badge: badge, byBand: byBand };
}
