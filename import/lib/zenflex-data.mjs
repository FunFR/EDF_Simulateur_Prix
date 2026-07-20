// Logique pure de préparation du calendrier Zenflex depuis l'API OPM d'EDF
// (particulier.edf.fr/services/rest/opm/getOPMStatut) : config du calendrier
// et parsing de la réponse (une date par requête, statut du jour demandé et
// du lendemain). Le mapping statut -> type, la fusion, le diff et la
// sérialisation sont partagés avec Tempo/EJP (tempo-data.mjs, fonctions
// paramétrées par config).
// Testé hermétiquement par tests/zenflex-data.test.mjs (aucun réseau ici).

// Même forme que les entrées de CALENDARS (tempo-data.mjs) ; `option` n'existe
// pas côté API OPM, il ne sert qu'aux messages d'erreur de daysByType.
export const ZENFLEX = {
    option: 'ZENFLEX',
    calendarName: 'zenflex-sobriete',
    relativePath: 'scripts/tarifs-lib/calendars/zenflex-sobriete.js',
    statusToType: { ZENF_PM: 'sobriete' },
    // ZENF_BONIF (ex. 2023-12-07) et ZENF_BONUS (jours d'été, ex. 2025-09-11) :
    // jours « bonifiés »/« bonus » annoncés par l'API mais non pricés par le
    // tarif Zen Week-End Flex du repo -> ignorés (à mapper vers un type si le
    // tarif les modélise un jour). NON_DETERMINE : jours futurs pas encore
    // annoncés et jours hors saison.
    ignoredStatuses: ['RAS', 'NON_DETERMINE', 'ZENF_BONIF', 'ZENF_BONUS'],
    types: {
        sobriete: { numberOfDays: 20, monthBegin: 10, monthEnd: 4 },
    },
    header: `// Calendrier des jours de sobriété de l'option Zen Week-End Flex (EDF).
// Les jours absents de la liste sont des jours normaux.
// Mis à jour par import/zenflex-update.mjs depuis l'API OPM d'EDF, dont
// l'historique commence à la saison 2023-2024 : les jours antérieurs au
// 2023-09-01 (saisie manuelle d'origine) sont préservés tels quels.`,
};

// Valide la réponse de l'API OPM pour la date demandée. Une réponse couvre
// deux jours : couleurJourJ (la date demandée) et couleurJourJ1 (le lendemain).
// -> [{ date: "AAAA-MM-JJ", statut }, { date: <lendemain>, statut }]
// Throw si la réponse n'a pas la forme attendue.
export function parseOpmResponse(json, dateIso) {
    if (typeof json?.couleurJourJ !== 'string' || typeof json?.couleurJourJ1 !== 'string') {
        throw new Error(`réponse OPM invalide pour ${dateIso} : ${JSON.stringify(json)}`);
    }
    return [
        { date: dateIso, statut: json.couleurJourJ },
        { date: nextDay(dateIso), statut: json.couleurJourJ1 },
    ];
}

// Dates à requêter pour couvrir [from, to] (ISO) : une date sur deux suffit
// puisque chaque réponse couvre la date demandée et son lendemain. La
// dernière réponse peut déborder d'un jour au-delà de to — un jour de
// sobriété annoncé pour le lendemain est une info utile, elle est gardée.
export function requestDates(fromIso, toIso) {
    const dates = [];
    for (let date = fromIso; date <= toIso; date = nextDay(nextDay(date))) {
        dates.push(date);
    }
    return dates;
}

// "AAAA-MM-JJ" -> lendemain "AAAA-MM-JJ"
export function nextDay(iso) {
    const date = new Date(`${iso}T12:00:00Z`);
    date.setUTCDate(date.getUTCDate() + 1);
    return date.toISOString().slice(0, 10);
}
