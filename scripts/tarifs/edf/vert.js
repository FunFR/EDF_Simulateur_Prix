defineTarif({
    name: "EDF - Vert Electrique",
    offer_type: "Marché",
    lastUpdate: "2026-08-01",
    isCommunity: false,
    subscription_url: "https://particulier.edf.fr/fr/accueil/electricite-gaz/offres-electricite/offres-marche/electricite-verte/vert-electrique.html",
    price_url: "https://particulier.edf.fr/content/dam/2-Actifs/Documents/Offres/grille-prix-vert-electrique.pdf",
    subscriptions: { 6: 15.69, 9: 19.62, 12: 23.39, 15: 26.93, 18: 30.59, 24: 38.37, 30: 45.52, 36: 52.72 },
    dayTypes: { bleu: { price: 19.35 } },
    // 6 kVA a un prix du kWh plus élevé (la grille majore aussi le 3 kVA, non modélisé ici)
    priceOverrides: { 6: { bleu: { price: 19.48 } } },
    dayRule: { type: "constant", dayType: "bleu" }
});

defineTarif({
    name: "EDF - Vert Electrique Heures Creuses",
    offer_type: "Marché",
    lastUpdate: "2026-08-01",
    isCommunity: false,
    subscription_url: "https://particulier.edf.fr/fr/accueil/electricite-gaz/offres-electricite/offres-marche/electricite-verte/vert-electrique.html",
    price_url: "https://particulier.edf.fr/content/dam/2-Actifs/Documents/Offres/grille-prix-vert-electrique.pdf",
    subscriptions: { 6: 15.69, 9: 19.62, 12: 23.39, 15: 26.93, 18: 30.59, 24: 38.37, 30: 45.52, 36: 52.72 },
    dayTypes: { bleu: { HP: 20.71, HC: 15.85 } },
    dayRule: { type: "constant", dayType: "bleu" },
    hcRanges: "custom"
});
