defineTarif({
    name: "EDF - Zen Fixe",
    offer_type: "Marché",
    lastUpdate: "2026-06-01",
    isCommunity: false,
    subscription_url: "https://particulier.edf.fr/fr/accueil/electricite-gaz/zen-fixe.html",
    price_url: "https://particulier.edf.fr/content/dam/2-Actifs/Documents/Offres/Grille-prix-zen-fixe.pdf",
    subscriptions: { 3: 12.03, 6: 15.65, 9: 19.56, 12: 23.32, 15: 26.84, 18: 30.49, 24: 38.24, 30: 45.37, 36: 52.54 },
    dayTypes: { bleu: { price: 18.38 } },
    // 3 et 6 kVA ont un prix du kWh plus élevé
    priceOverrides: { 3: { bleu: { price: 18.50 } }, 6: { bleu: { price: 18.50 } } },
    dayRule: { type: "constant", dayType: "bleu" }
});

defineTarif({
    name: "EDF - Zen Fixe Heures Creuses",
    offer_type: "Marché",
    lastUpdate: "2026-06-01",
    isCommunity: false,
    subscription_url: "https://particulier.edf.fr/fr/accueil/electricite-gaz/zen-fixe.html",
    price_url: "https://particulier.edf.fr/content/dam/2-Actifs/Documents/Offres/Grille-prix-zen-fixe.pdf",
    subscriptions: { 6: 15.65, 9: 19.56, 12: 23.32, 15: 26.84, 18: 30.49, 24: 38.24, 30: 45.37, 36: 52.54 },
    dayTypes: { bleu: { HP: 19.69, HC: 15.1 } },
    dayRule: { type: "constant", dayType: "bleu" },
    hcRanges: "custom"
});
