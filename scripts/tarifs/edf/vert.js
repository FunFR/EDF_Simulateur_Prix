defineTarif({
    name: "EDF - Vert Electrique",
    offer_type: "Marché",
    lastUpdate: "2026-03-16",
    isCommunity: false,
    subscription_url: "https://particulier.edf.fr/fr/accueil/electricite-gaz/offres-electricite/offres-marche/electricite-verte/vert-electrique.html",
    price_url: "https://particulier.edf.fr/content/dam/2-Actifs/Documents/Offres/grille-prix-vert-electrique.pdf",
    subscriptions: { 6: 15.65, 9: 19.56, 12: 23.32, 15: 26.84, 18: 30.49, 24: 38.24, 30: 45.37, 36: 52.54 },
    dayTypes: { bleu: { price: 19.37 } },
    // 6 kVA a un prix du kWh plus élevé (la grille majore aussi le 3 kVA, non modélisé ici)
    priceOverrides: { 6: { bleu: { price: 19.51 } } },
    dayRule: { type: "constant", dayType: "bleu" }
});

defineTarif({
    name: "EDF - Vert Electrique Heures Creuses",
    offer_type: "Marché",
    lastUpdate: "2026-03-16",
    isCommunity: false,
    subscription_url: "https://particulier.edf.fr/fr/accueil/electricite-gaz/offres-electricite/offres-marche/electricite-verte/vert-electrique.html",
    price_url: "https://particulier.edf.fr/content/dam/2-Actifs/Documents/Offres/grille-prix-vert-electrique.pdf",
    subscriptions: { 6: 15.65, 9: 19.56, 12: 23.32, 15: 26.84, 18: 30.49, 24: 38.24, 30: 45.37, 36: 52.54 },
    dayTypes: { bleu: { HP: 20.74, HC: 15.88 } },
    dayRule: { type: "constant", dayType: "bleu" },
    hcRanges: "custom"
});
