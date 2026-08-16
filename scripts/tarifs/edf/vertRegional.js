defineTarif({
    name: "EDF - Vert Electrique Régional",
    offer_type: "Marché",
    lastUpdate: "2026-08-01",
    isCommunity: false,
    subscription_url: "https://particulier.edf.fr/fr/accueil/electricite-gaz/offres-electricite/offres-marche/electricite-verte/vert-electrique-regional.html",
    price_url: "https://particulier.edf.fr/content/dam/2-Actifs/Documents/Offres/grille-prix-vert-electrique-regional.pdf",
    subscriptions: { 6: 15.69, 9: 19.62, 12: 23.39, 15: 26.93, 18: 30.59, 24: 38.37, 30: 45.52, 36: 52.72 },
    dayTypes: { bleu: { price: 19.74 } },
    // 6 kVA a un prix du kWh plus bas que les autres puissances
    priceOverrides: { 6: { bleu: { price: 19.54 } } },
    dayRule: { type: "constant", dayType: "bleu" }
});

defineTarif({
    name: "EDF - Vert Electrique Régional Heures Creuses",
    offer_type: "Marché",
    lastUpdate: "2026-08-01",
    isCommunity: false,
    subscription_url: "https://particulier.edf.fr/fr/accueil/electricite-gaz/offres-electricite/offres-marche/electricite-verte/vert-electrique-regional.html",
    price_url: "https://particulier.edf.fr/content/dam/2-Actifs/Documents/Offres/grille-prix-vert-electrique-regional.pdf",
    subscriptions: { 6: 15.69, 9: 19.62, 12: 23.39, 15: 26.93, 18: 30.59, 24: 38.37, 30: 45.52, 36: 52.72 },
    dayTypes: { bleu: { HP: 21.37, HC: 15.28 } },
    dayRule: { type: "constant", dayType: "bleu" },
    hcRanges: "custom"
});
