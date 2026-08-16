// Les offres Zen Week-End Plus ajoutent un jour avantageux choisi par
// l'utilisateur (réglage « jour Zen+ » du simulateur, via userDaySetting).
defineTarif({
    name: "EDF - Zen Week-End Plus",
    offer_type: "Marché",
    lastUpdate: "2026-08-01",
    isCommunity: false,
    subscription_url: "https://particulier.edf.fr/fr/accueil/electricite-gaz/offres-electricite/offres-marche/electricite-weekend/zen-week-end-plus.html",
    price_url: "https://particulier.edf.fr/content/dam/2-Actifs/Documents/Offres/grille-prix-zen-week-end-plus.pdf",
    subscriptions: { 6: 15.69, 9: 19.62, 12: 23.39, 15: 26.93, 18: 30.59, 24: 38.37, 30: 45.52, 36: 52.72 },
    dayTypes: {
        bleu: { price: 21.54 },
        weekend: { price: 16.18 }
    },
    dayRule: { type: "weekly", default: "bleu", days: { weekend: [0, 6] }, userDaySetting: "jourZenPlus" }
});

defineTarif({
    name: "EDF - Zen Week-End Plus HC",
    offer_type: "Marché",
    lastUpdate: "2026-08-01",
    isCommunity: false,
    subscription_url: "https://particulier.edf.fr/fr/accueil/electricite-gaz/offres-electricite/offres-marche/electricite-weekend/zen-week-end-plus.html",
    price_url: "https://particulier.edf.fr/content/dam/2-Actifs/Documents/Offres/grille-prix-zen-week-end-plus.pdf",
    subscriptions: { 6: 15.69, 9: 19.62, 12: 23.39, 15: 26.93, 18: 30.59, 24: 38.37, 30: 45.52, 36: 52.72 },
    dayTypes: {
        bleu: { HP: 22.13, HC: 16.6 },
        weekend: { HP: 16.6, HC: 16.6 }   // tout le week-end au prix HC
    },
    dayRule: { type: "weekly", default: "bleu", days: { weekend: [0, 6] }, userDaySetting: "jourZenPlus" },
    hcRanges: "custom"
});
