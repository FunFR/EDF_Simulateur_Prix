// Logique pure de préparation des calendriers Tempo / EJP depuis l'API EDF
// (api-commerce.edf.fr) : parsing de la réponse, mapping statut -> type de
// jour, fusion avec l'existant, sérialisation des fichiers
// scripts/tarifs-lib/calendars/*.js.
// Testé hermétiquement par tests/tempo-data.test.mjs (aucun réseau ici).

// Tout ce qui diffère entre les deux calendriers gérés par tempo-update.mjs.
// Les statuts « par défaut » (TEMPO_BLEU, NON_EJP) et NON_DEFINI (jours
// futurs pas encore annoncés) ne sont pas stockés : le calendrier ne liste
// que les jours spéciaux, tout jour absent est bleu / non-EJP.
export const CALENDARS = {
    TEMPO: {
        option: 'TEMPO',
        calendarName: 'tempo-edf',
        relativePath: 'scripts/tarifs-lib/calendars/tempo-edf.js',
        statusToType: { TEMPO_ROUGE: 'rouge', TEMPO_BLANC: 'blanc' },
        ignoredStatuses: ['TEMPO_BLEU', 'NON_DEFINI'],
        // Métadonnées de saison, préservées telles quelles à la sérialisation.
        types: {
            rouge: { numberOfDays: 22, monthBegin: 11, monthEnd: 3 },
            blanc: { numberOfDays: 43, monthBegin: 10, monthEnd: 6 },
        },
        header: `// Calendrier des jours Tempo (EDF), partagé entre les tarifs qui suivent le
// calendrier Tempo officiel (EDF - Tempo aujourd'hui, réutilisable par d'autres
// fournisseurs). Les jours absents des listes sont bleus.
// Mis à jour par import/tempo-update.mjs depuis l'API officielle EDF ; un ajout
// manuel (date "AAAA/MM/JJ") reste possible, il sera préservé ou corrigé au
// prochain run du script.`,
    },
    EJP: {
        option: 'EJP',
        calendarName: 'ejp-edf',
        relativePath: 'scripts/tarifs-lib/calendars/ejp-edf.js',
        statusToType: { EJP: 'rouge' },
        // HORS_PERIODE_EJP : renvoyé hors saison (avril -> octobre).
        ignoredStatuses: ['NON_EJP', 'HORS_PERIODE_EJP', 'NON_DEFINI'],
        types: {
            rouge: { numberOfDays: 22, monthBegin: 11, monthEnd: 3 },
        },
        header: `// Calendrier des jours de pointe EJP (EDF). Offre fermée à la souscription,
// le calendrier reste nécessaire pour simuler les contrats existants.
// Mis à jour par import/tempo-update.mjs depuis l'API officielle EDF ; un ajout
// manuel (date "AAAA/MM/JJ") reste possible, il sera préservé ou corrigé au
// prochain run du script.`,
    },
};

// Valide la réponse de l'API et en extrait le calendrier de l'option demandée.
// -> [{ date: "AAAA-MM-JJ", statut }] ; throw si erreurs API ou option absente.
export function parseCalendarResponse(json, option) {
    const apiErrors = json?.errors ?? [];
    if (apiErrors.length > 0) {
        const details = apiErrors.map(e => `${e.code} : ${e.description}`).join(' ; ');
        throw new Error(`erreurs API EDF (${details})`);
    }
    const entry = (json?.content?.options ?? []).find(o => o.option === option);
    if (!entry || !Array.isArray(entry.calendrier)) {
        throw new Error(`option "${option}" absente de la réponse API`);
    }
    return entry.calendrier.map(({ dateApplication, statut }) => {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateApplication ?? '')) {
            throw new Error(`date API invalide "${dateApplication}" (AAAA-MM-JJ attendu)`);
        }
        return { date: dateApplication, statut };
    });
}

// Mappe les entrées API vers les types de jours du calendrier. Les statuts
// par défaut sont ignorés, tout statut inconnu fait échouer bruyamment
// (changement de contrat API à examiner à la main).
// -> { rouge: ["AAAA/MM/JJ", ...], blanc: [...] } (clés = config.types, triées)
export function daysByType(entries, config) {
    const result = {};
    for (const type of Object.keys(config.types)) result[type] = [];
    for (const { date, statut } of entries) {
        const type = config.statusToType[statut];
        if (type === undefined) {
            if (!config.ignoredStatuses.includes(statut)) {
                throw new Error(`statut inconnu "${statut}" le ${date} (option ${config.option})`);
            }
            continue;
        }
        result[type].push(date.replaceAll('-', '/'));
    }
    for (const type of Object.keys(result)) {
        result[type] = [...new Set(result[type])].sort();
    }
    return result;
}

// Fusionne l'existant avec les jours fraîchement récupérés : toute date
// présente dans le fetch est d'abord retirée de tous les types existants
// (l'API officielle gagne, y compris quand un jour redevient bleu), puis
// les jours du fetch sont ajoutés. Tri + dédup par type.
export function mergeDaysByType(existing, fetched, fetchedRange) {
    const [from, to] = fetchedRange; // "AAAA/MM/JJ"
    const merged = {};
    const types = new Set([...Object.keys(existing), ...Object.keys(fetched)]);
    for (const type of types) {
        const kept = (existing[type] ?? []).filter(d => d < from || d > to);
        merged[type] = [...new Set([...kept, ...(fetched[type] ?? [])])].sort();
    }
    return merged;
}

// -> { added: { type: [dates] }, removed: { type: [dates] } } pour le rapport.
export function diffDaysByType(existing, next) {
    const added = {};
    const removed = {};
    const types = new Set([...Object.keys(existing), ...Object.keys(next)]);
    for (const type of types) {
        const before = new Set(existing[type] ?? []);
        const after = new Set(next[type] ?? []);
        added[type] = [...after].filter(d => !before.has(d)).sort();
        removed[type] = [...before].filter(d => !after.has(d)).sort();
    }
    return { added, removed };
}

// Sérialise le fichier calendrier complet (format identique à l'existant :
// dates triées, une par ligne, indentation 4/8/12, fins de ligne \n).
export function serializeCalendarFile(config, days) {
    const blocks = Object.entries(config.types).map(([type, meta]) => {
        const dates = [...new Set(days[type] ?? [])].sort();
        const dateLines = dates.map(d => `            "${d}",`).join('\n');
        return `    ${type}: {
        numberOfDays: ${meta.numberOfDays},
        monthBegin: ${meta.monthBegin},
        monthEnd: ${meta.monthEnd},
        days: [
${dateLines}
        ]
    }`;
    });
    return `${config.header}
defineCalendar("${config.calendarName}", {
${blocks.join(',\n')}
});
`;
}

// Découpe [from, to] (ISO) en tranches d'au plus un an calendaire : l'API
// EDF refuse les plages trop larges (~2 ans -> HTTP 500).
// -> [["2020-11-01", "2020-12-31"], ["2021-01-01", ...], ...]
export function yearlyChunks(from, to) {
    const chunks = [];
    let cursor = from;
    while (cursor <= to) {
        const year = Number(cursor.slice(0, 4));
        const lastOfYear = `${year}-12-31`;
        chunks.push([cursor, lastOfYear <= to ? lastOfYear : to]);
        cursor = `${year + 1}-01-01`;
    }
    return chunks;
}
