// Les offres Zen Week-End Plus ajoutent un jour avantageux choisi par
// l'utilisateur (réglage « jour Zen+ » du simulateur, via userDaySetting).
defineTarif({
    name: "EDF - Zen Week-End Plus",
    offer_type: "Marché",
    lastUpdate: "2026-02-01",
    isCommunity: false,
    subscription_url: "https://particulier.edf.fr/fr/accueil/electricite-gaz/offres-electricite/offres-marche/electricite-weekend/zen-week-end-plus.html",
    price_url: "https://particulier.edf.fr/content/dam/2-Actifs/Documents/Offres/grille-prix-zen-week-end-plus.pdf",
    subscriptions: { 6: 14.78, 9: 18.49, 12: 22.21, 15: 25.74, 18: 29.23, 24: 36.84, 30: 44.07, 36: 51.50 },
    dayTypes: {
        bleu: { price: 21.33 },
        weekend: { price: 16.04 }
    },
    dayRule: { type: "weekly", default: "bleu", days: { weekend: [0, 6] }, userDaySetting: "jourZenPlus" }
});

defineTarif({
    name: "EDF - Zen Week-End Plus HC",
    offer_type: "Marché",
    lastUpdate: "2026-02-01",
    isCommunity: false,
    subscription_url: "https://particulier.edf.fr/fr/accueil/electricite-gaz/offres-electricite/offres-marche/electricite-weekend/zen-week-end-plus.html",
    price_url: "https://particulier.edf.fr/content/dam/2-Actifs/Documents/Offres/grille-prix-zen-week-end-plus.pdf",
    subscriptions: { 6: 15.05, 9: 18.91, 12: 22.65, 15: 26.17, 18: 29.81, 24: 37.52, 30: 44.65, 36: 51.82 },
    dayTypes: {
        bleu: { HP: 22.13, HC: 16.60 },
        weekend: { HP: 16.60, HC: 16.60 }   // tout le week-end au prix HC
    },
    dayRule: { type: "weekly", default: "bleu", days: { weekend: [0, 6] }, userDaySetting: "jourZenPlus" },
    hcRanges: "custom"
});
