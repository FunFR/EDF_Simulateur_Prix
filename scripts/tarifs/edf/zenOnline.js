defineTarif({
    name: "EDF - Zen Online",
    offer_type: "Marché",
    lastUpdate: "2026-08-01",
    isCommunity: false,
    subscription_url: "https://particulier.edf.fr/fr/accueil/electricite-gaz/offres-electricite/offres-marche/electricite-weekend/zen-online.html",
    price_url: "https://particulier.edf.fr/content/dam/2-Actifs/Documents/Offres/grille-prix-zen-online.pdf",
    subscriptions: { 3: 12.13, 6: 15.86, 9: 19.88, 12: 23.76, 15: 27.4, 18: 31.14, 24: 39.14, 30: 46.47, 36: 53.88 },
    dayTypes: { bleu: { price: 19.09 } },
    // 3 et 6 kVA ont un prix du kWh plus élevé
    priceOverrides: { 3: { bleu: { price: 19.25 } }, 6: { bleu: { price: 19.25 } } },
    dayRule: { type: "constant", dayType: "bleu" }
});

defineTarif({
    name: "EDF - Zen Online Heures Creuses",
    offer_type: "Marché",
    lastUpdate: "2026-08-01",
    isCommunity: false,
    subscription_url: "https://particulier.edf.fr/fr/accueil/electricite-gaz/offres-electricite/offres-marche/electricite-weekend/zen-online.html",
    price_url: "https://particulier.edf.fr/content/dam/2-Actifs/Documents/Offres/grille-prix-zen-online.pdf",
    subscriptions: { 6: 15.86, 9: 19.88, 12: 23.76, 15: 27.4, 18: 31.14, 24: 39.14, 30: 46.47, 36: 53.88 },
    dayTypes: { bleu: { HP: 20.59, HC: 15.31 } },
    dayRule: { type: "constant", dayType: "bleu" },
    hcRanges: "custom"
});
