defineTarif({
    name: "EDF - Vert Electrique",
    offer_type: "Marché",
    lastUpdate: "2026-02-01",
    isCommunity: false,
    subscription_url: "https://particulier.edf.fr/fr/accueil/electricite-gaz/offres-electricite/offres-marche/electricite-verte/vert-electrique.html",
    price_url: "https://particulier.edf.fr/content/dam/2-Actifs/Documents/Offres/grille-prix-vert-electrique.pdf",
    subscriptions: { 6: 14.78, 9: 18.49, 12: 22.21, 15: 25.74, 18: 29.23, 24: 36.84, 30: 44.07, 36: 51.50 },
    dayTypes: { bleu: { price: 18.81 } },
    dayRule: { type: "constant", dayType: "bleu" }
});

defineTarif({
    name: "EDF - Vert Electrique Heures Creuses",
    offer_type: "Marché",
    lastUpdate: "2026-02-01",
    isCommunity: false,
    subscription_url: "https://particulier.edf.fr/fr/accueil/electricite-gaz/offres-electricite/offres-marche/electricite-verte/vert-electrique.html",
    price_url: "https://particulier.edf.fr/content/dam/2-Actifs/Documents/Offres/grille-prix-vert-electrique.pdf",
    subscriptions: { 6: 15.05, 9: 18.91, 12: 22.65, 15: 26.17, 18: 29.81, 24: 37.52, 30: 44.65, 36: 51.82 },
    dayTypes: { bleu: { HP: 20.21, HC: 15.76 } },
    dayRule: { type: "constant", dayType: "bleu" },
    hcRanges: "custom"
});
