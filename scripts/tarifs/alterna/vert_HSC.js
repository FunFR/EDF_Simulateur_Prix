// Offre « véhicule électrique » : heures pleines 7-11h et 18-23h toute
// l'année ; le reste dépend de la saison — en été (avril-octobre) les heures
// super creuses sont en pleine journée (11-18h, production solaire) et la
// nuit est en creuses ; en hiver (novembre-mars) c'est l'inverse, les super
// creuses sont la nuit (23h-7h) et 11-18h sont des creuses normales. Tout est
// facturé au prix du type de jour (pas de distinction HP/HC dans les plages).
// Note : la version d'origine (origin/main) déclarait hscEte avec un
// prixKwhHP jamais consulté, ce qui excluait silencieusement les heures
// 11h-18h d'été du total (prix NaN). Corrigé ici : hscEte est facturé au
// prix publié 13,13 c/kWh.
defineTarif({
    name: "Alterna - Heures Super Creuses",
    offer_type: "Marché",
    lastUpdate: "2026-05-07",
    isCommunity: true,
    subscription_url: "https://www.alterna-energie.fr",
    price_url: "https://www.alterna-energie.fr/tarifs-electricite-vehicule-electrique",
    subscriptions: {
        6: 16.65,
        9: 20.83,
        12: 25.01,
        15: 29.19,
        18: 33.37,
        24: 41.74,
        30: 50.10,
        36: 58.46
    },
    dayTypes: {
        hpEte: { price: 17.80 },
        hscEte: { price: 13.13 },
        hcEte: { price: 16.24 },
        hpHiver: { price: 20.91 },
        hscHiver: { price: 16.24 },
        hcHiver: { price: 18.27 }
    },
    dayRule: {
        type: "season",
        // Le type par défaut de chaque saison couvre la nuit (23h-7h).
        seasons: {
            hcEte: { months: [4, 5, 6, 7, 8, 9, 10] },
            hscHiver: { months: [11, 12, 1, 2, 3] }
        },
        hourSubTypes: {
            hcEte: [
                { fromHour: 7, toHour: 11, dayType: "hpEte" },
                { fromHour: 11, toHour: 18, dayType: "hscEte" },
                { fromHour: 18, toHour: 23, dayType: "hpEte" }
            ],
            hscHiver: [
                { fromHour: 7, toHour: 11, dayType: "hpHiver" },
                { fromHour: 11, toHour: 18, dayType: "hcHiver" },
                { fromHour: 18, toHour: 23, dayType: "hpHiver" }
            ]
        }
    }
});
