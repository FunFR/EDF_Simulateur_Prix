defineTarif({
    name: "EDF - Bleu",
    offer_type: "TRV",
    lastUpdate: "2026-02-01",
    isCommunity: false,
    subscription_url: "https://particulier.edf.fr/fr/accueil/electricite-gaz/offres-electricite/tarif-bleu.html",
    price_url: "https://particulier.edf.fr/content/dam/2-Actifs/Documents/Offres/Grille_prix_Tarif_Bleu.pdf",
    subscriptions: { 3: 12.03, 6: 15.65, 9: 19.56, 12: 23.32, 15: 26.84, 18: 30.49, 24: 38.24, 30: 45.37, 36: 52.54 },
    dayTypes: { bleu: { price: 19.27 } },
    // 3 et 6 kVA ont un prix du kWh plus élevé
    priceOverrides: { 3: { bleu: { price: 19.40 } }, 6: { bleu: { price: 19.40 } } },
    dayRule: { type: "constant", dayType: "bleu" }
});

defineTarif({
    name: "EDF - Bleu Heures Creuses",
    offer_type: "TRV",
    lastUpdate: "2026-02-01",
    isCommunity: false,
    subscription_url: "https://particulier.edf.fr/fr/accueil/electricite-gaz/offres-electricite/tarif-bleu.html",
    price_url: "https://particulier.edf.fr/content/dam/2-Actifs/Documents/Offres/Grille_prix_Tarif_Bleu.pdf",
    subscriptions: { 6: 15.65, 9: 19.56, 12: 23.32, 15: 26.84, 18: 30.49, 24: 38.24, 30: 45.37, 36: 52.54 },
    dayTypes: { bleu: { HP: 20.65, HC: 15.79 } },
    dayRule: { type: "constant", dayType: "bleu" },
    hcRanges: "custom"
});
