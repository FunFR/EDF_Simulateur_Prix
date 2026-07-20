defineTarif({
    name: "EDF - Vert Electrique Week-End",
    offer_type: "Marché",
    lastUpdate: "2026-03-16",
    isCommunity: false,
    subscription_url: "https://particulier.edf.fr/fr/accueil/electricite-gaz/offres-electricite/offres-marche/electricite-verte/vert-electrique-week-end.html",
    price_url: "https://particulier.edf.fr/content/dam/2-Actifs/Documents/Offres/grille-prix-vert-electrique-weekend.pdf",
    subscriptions: { 6: 15.65, 9: 19.56, 12: 23.32, 15: 26.84, 18: 30.49, 24: 38.24, 30: 45.37, 36: 52.54 },
    dayTypes: {
        bleu: { price: 21.1 },
        weekend: { price: 15.88 }
    },
    dayRule: { type: "weekly", default: "bleu", days: { weekend: [0, 6] } }
});

defineTarif({
    name: "EDF - Vert Electrique Week-End Heures Creuses",
    offer_type: "Marché",
    lastUpdate: "2026-03-16",
    isCommunity: false,
    subscription_url: "https://particulier.edf.fr/fr/accueil/electricite-gaz/offres-electricite/offres-marche/electricite-verte/vert-electrique-week-end.html",
    price_url: "https://particulier.edf.fr/content/dam/2-Actifs/Documents/Offres/grille-prix-vert-electrique-weekend.pdf",
    subscriptions: { 6: 15.65, 9: 19.56, 12: 23.32, 15: 26.84, 18: 30.49, 24: 38.24, 30: 45.37, 36: 52.54 },
    dayTypes: {
        bleu: { HP: 21.88, HC: 16.43 },
        weekend: { HP: 16.43, HC: 16.43 }   // tout le week-end au prix HC
    },
    dayRule: { type: "weekly", default: "bleu", days: { weekend: [0, 6] } },
    hcRanges: "custom"
});
