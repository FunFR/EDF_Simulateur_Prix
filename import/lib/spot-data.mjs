// Logique pure de préparation des prix spot EPEX FR (energy-charts.info) :
// groupage des timestamps par jour local Europe/Paris, normalisation des
// jours DST à 24/96 valeurs, sérialisation des fichiers annuels
// scripts/tarifs-lib/spot/epex-fr-<année>.js.
// Testé hermétiquement par tests/spot-data.test.mjs (aucun réseau ici).

const PARIS_FORMATTER = new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'Europe/Paris',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
});

// -> { date: "AAAA/MM/JJ", label: "HH:MM" } en heure locale Europe/Paris.
export function parisDayAndLabel(unixSeconds) {
    const parts = {};
    for (const { type, value } of PARIS_FORMATTER.formatToParts(new Date(unixSeconds * 1000))) {
        parts[type] = value;
    }
    // Intl peut rendre "24" pour minuit selon les environnements : normalise.
    const hour = parts.hour === '24' ? '00' : parts.hour;
    return {
        date: `${parts.year}/${parts.month}/${parts.day}`,
        label: `${hour}:${parts.minute}`,
    };
}

// Groupe les paires (unix_seconds[i], price[i]) par jour local Europe/Paris.
// Les valeurs non numériques (null de l'API) sont écartées : le jour
// correspondant sera incomplet et donc omis par normalizeDay.
// -> Map<"AAAA/MM/JJ", [{ seconds, label, price }]> (triée par timestamp)
export function groupByLocalDay(unixSeconds, prices) {
    const byDay = new Map();
    for (let i = 0; i < unixSeconds.length; i++) {
        const price = prices[i];
        if (typeof price !== 'number' || !isFinite(price)) continue;
        const seconds = unixSeconds[i];
        const { date, label } = parisDayAndLabel(seconds);
        if (!byDay.has(date)) byDay.set(date, []);
        byDay.get(date).push({ seconds, label, price });
    }
    for (const entries of byDay.values()) {
        entries.sort((a, b) => a.seconds - b.seconds);
    }
    return byDay;
}

// Libellés attendus d'une journée normalisée (24 pas de 60 min ou 96 de 15 min).
function slotLabels(slotCount) {
    const step = 1440 / slotCount;
    const labels = [];
    for (let m = 0; m < 1440; m += step) {
        labels.push(`${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`);
    }
    return labels;
}

// Normalise une journée à exactement 24 ou 96 valeurs :
// - jour normal : une valeur par créneau ;
// - passage à l'heure d'été (23 h locales) : l'heure 02 inexistante est
//   comblée avec la valeur du créneau précédent (jamais facturée : la conso
//   locale n'a pas non plus ces relevés) ;
// - passage à l'heure d'hiver (25 h locales) : les deux occurrences de
//   l'heure 02 sont moyennées.
// Toute autre anomalie (trou hors heure 02, doublon hors heure 02, jour
// incomplet) -> null : le jour est omis et le moteur le marquera en erreur.
export function normalizeDay(entries) {
    if (!entries || entries.length === 0) return null;
    // Granularité déduite du volume : une journée quart-horaire fait au
    // moins 92 entrées (année DST), une journée horaire au plus 25.
    const slotCount = entries.length >= 90 ? 96 : 24;

    const byLabel = new Map();
    for (const { label, price } of entries) {
        if (!byLabel.has(label)) byLabel.set(label, []);
        byLabel.get(label).push(price);
    }

    const values = [];
    for (const label of slotLabels(slotCount)) {
        const prices = byLabel.get(label);
        const isDstHour = label.startsWith('02:');
        if (!prices) {
            // Créneau absent : uniquement toléré pour l'heure 02 (heure d'été).
            if (!isDstHour || values.length === 0) return null;
            values.push(values[values.length - 1]);
        } else if (prices.length === 1) {
            values.push(prices[0]);
        } else if (prices.length === 2 && isDstHour) {
            values.push((prices[0] + prices[1]) / 2);
        } else {
            return null; // doublon inattendu
        }
    }
    return values.map(v => Math.round(v * 100) / 100);
}

// Applique groupByLocalDay + normalizeDay et ne retient que les jours valides.
// -> { days: { "AAAA/MM/JJ": number[] }, skipped: ["AAAA/MM/JJ"] }
export function buildDays(unixSeconds, prices) {
    const days = {};
    const skipped = [];
    for (const [date, entries] of groupByLocalDay(unixSeconds, prices)) {
        const values = normalizeDay(entries);
        if (values) {
            days[date] = values;
        } else {
            skipped.push(date);
        }
    }
    return { days, skipped };
}

// Sérialise le fichier d'une année (dates triées, une ligne par jour, format
// stable pour des diffs d'append propres).
export function serializeYearFile(sourceName, year, daysOfYear) {
    const dates = Object.keys(daysOfYear).sort();
    const lines = dates.map(date =>
        `"${date}": [${daysOfYear[date].map(formatNumber).join(',')}]`);
    return `// Prix spot EPEX FR Day-Ahead (EUR/MWh), ${year}, jours locaux Europe/Paris.
// Source : energy-charts.info — données Bundesnetzagentur | SMARD.de, licence
// CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/).
// Fichier généré par import/spot-update.mjs — ne pas éditer à la main.
// 24 valeurs/jour (pas horaire) ou 96 (pas quart-horaire, depuis 2025-10-01) ;
// jours DST normalisés à 24/96 valeurs (voir import/lib/spot-data.mjs).
defineSpotPrices("${sourceName}", {
${lines.join(',\n')}
});
`;
}

// Nombre compact sans notation exponentielle ni zéros inutiles (12.5, -0.07, 80).
function formatNumber(value) {
    return String(Math.round(value * 100) / 100);
}

// Répartit les jours par année -> Map<"2023", { date: values }>
export function splitByYear(days) {
    const byYear = new Map();
    for (const [date, values] of Object.entries(days)) {
        const year = date.slice(0, 4);
        if (!byYear.has(year)) byYear.set(year, {});
        byYear.get(year)[date] = values;
    }
    return byYear;
}
