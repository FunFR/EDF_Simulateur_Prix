defineTarif({
    name: "EDF - Vert Electrique Week-End",
    offer_type: "Marché",
    lastUpdate: "2026-08-01",
    isCommunity: false,
    subscription_url: "https://particulier.edf.fr/fr/accueil/electricite-gaz/offres-electricite/offres-marche/electricite-verte/vert-electrique-week-end.html",
    price_url: "https://particulier.edf.fr/content/dam/2-Actifs/Documents/Offres/grille-prix-vert-electrique-weekend.pdf",
    subscriptions: { 6: 15.69, 9: 19.62, 12: 23.39, 15: 26.93, 18: 30.59, 24: 38.37, 30: 45.52, 36: 52.72 },
    dayTypes: {
        bleu: { price: 21.07 },
        weekend: { price: 15.85 }
    },
    dayRule: { type: "weekly", default: "bleu", days: { weekend: [0, 6] } }
});

defineTarif({
    name: "EDF - Vert Electrique Week-End Heures Creuses",
    offer_type: "Marché",
    lastUpdate: "2026-08-01",
    isCommunity: false,
    subscription_url: "https://particulier.edf.fr/fr/accueil/electricite-gaz/offres-electricite/offres-marche/electricite-verte/vert-electrique-week-end.html",
    price_url: "https://particulier.edf.fr/content/dam/2-Actifs/Documents/Offres/grille-prix-vert-electrique-weekend.pdf",
    subscriptions: { 6: 15.69, 9: 19.62, 12: 23.39, 15: 26.93, 18: 30.59, 24: 39.11, 30: 46.45, 36: 52.72 },
    dayTypes: {
        bleu: { HP: 21.85, HC: 16.41 },
        weekend: { HP: 16.41, HC: 16.41 }   // tout le week-end au prix HC
    },
    dayRule: { type: "weekly", default: "bleu", days: { weekend: [0, 6] } },
    hcRanges: "custom"
});
