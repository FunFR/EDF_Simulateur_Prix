defineTarif({
    name: "EDF - Vert Electrique Auto",
    offer_type: "Marché",
    lastUpdate: "2026-08-01",
    isCommunity: false,
    subscription_url: "https://particulier.edf.fr/fr/accueil/electricite-gaz/offres-electricite/offres-marche/electricite-verte/vert-electrique-auto.html",
    price_url: "https://particulier.edf.fr/content/dam/2-Actifs/Documents/Offres/grille-prix-vert-electrique-auto.pdf",
    subscriptions: { 6: 15.69, 9: 19.62, 12: 23.39, 15: 26.93, 18: 30.59, 24: 38.37, 30: 45.52, 36: 52.72 },
    dayTypes: { bleu: { HP: 22.74, HC: 13.21 } },
    dayRule: { type: "constant", dayType: "bleu" },
    hcRanges: "custom"
});
