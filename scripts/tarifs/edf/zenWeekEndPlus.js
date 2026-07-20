// Les offres Zen Week-End Plus ajoutent un jour avantageux choisi par
// l'utilisateur (réglage « jour Zen+ » du simulateur, via userDaySetting).
defineTarif({
    name: "EDF - Zen Week-End Plus",
    offer_type: "Marché",
    lastUpdate: "2026-03-16",
    isCommunity: false,
    subscription_url: "https://particulier.edf.fr/fr/accueil/electricite-gaz/offres-electricite/offres-marche/electricite-weekend/zen-week-end-plus.html",
    price_url: "https://particulier.edf.fr/content/dam/2-Actifs/Documents/Offres/grille-prix-zen-week-end-plus.pdf",
    subscriptions: { 6: 15.65, 9: 19.56, 12: 23.32, 15: 26.84, 18: 30.49, 24: 38.24, 30: 45.37, 36: 52.54 },
    dayTypes: {
        bleu: { price: 22.48 },
        weekend: { price: 16.85 }
    },
    dayRule: { type: "weekly", default: "bleu", days: { weekend: [0, 6] }, userDaySetting: "jourZenPlus" }
});

defineTarif({
    name: "EDF - Zen Week-End Plus HC",
    offer_type: "Marché",
    lastUpdate: "2026-03-16",
    isCommunity: false,
    subscription_url: "https://particulier.edf.fr/fr/accueil/electricite-gaz/offres-electricite/offres-marche/electricite-weekend/zen-week-end-plus.html",
    price_url: "https://particulier.edf.fr/content/dam/2-Actifs/Documents/Offres/grille-prix-zen-week-end-plus.pdf",
    subscriptions: { 6: 15.65, 9: 19.56, 12: 23.32, 15: 26.84, 18: 30.49, 24: 38.24, 30: 45.37, 36: 52.54 },
    dayTypes: {
        bleu: { HP: 23.05, HC: 17.24 },
        weekend: { HP: 17.24, HC: 17.24 }   // tout le week-end au prix HC
    },
    dayRule: { type: "weekly", default: "bleu", days: { weekend: [0, 6] }, userDaySetting: "jourZenPlus" },
    hcRanges: "custom"
});
