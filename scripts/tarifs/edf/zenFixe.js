defineTarif({
    name: "EDF - Zen Fixe",
    offer_type: "Marché",
    lastUpdate: "2026-08-01",
    isCommunity: false,
    subscription_url: "https://particulier.edf.fr/fr/accueil/electricite-gaz/zen-fixe.html",
    price_url: "https://particulier.edf.fr/content/dam/2-Actifs/Documents/Offres/Grille-prix-zen-fixe.pdf",
    subscriptions: { 3: 12.67, 6: 17.22, 9: 23.92, 12: 29.7, 15: 34, 18: 39.24, 24: 49.77, 30: 57.76, 36: 68.88 },
    dayTypes: { bleu: { price: 18.35 } },
    // 3 et 6 kVA ont un prix du kWh plus élevé
    priceOverrides: { 3: { bleu: { price: 18.47 } }, 6: { bleu: { price: 18.47 } } },
    dayRule: { type: "constant", dayType: "bleu" }
});

defineTarif({
    name: "EDF - Zen Fixe Heures Creuses",
    offer_type: "Marché",
    lastUpdate: "2026-08-01",
    isCommunity: false,
    subscription_url: "https://particulier.edf.fr/fr/accueil/electricite-gaz/zen-fixe.html",
    price_url: "https://particulier.edf.fr/content/dam/2-Actifs/Documents/Offres/Grille-prix-zen-fixe.pdf",
    subscriptions: { 6: 18.36, 9: 24.77, 12: 30.91, 15: 35.02, 18: 40.51, 24: 51.74, 30: 62.38, 36: 70.36 },
    dayTypes: { bleu: { HP: 19.66, HC: 15.07 } },
    dayRule: { type: "constant", dayType: "bleu" },
    hcRanges: "custom"
});
