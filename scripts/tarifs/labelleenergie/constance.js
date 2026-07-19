defineTarif({
    name: "La Belle Energie - Constance",
    offer_type: "Marché",
    lastUpdate: "2025-11-01",
    isCommunity: true,
    subscription_url: "https://labellenergie.fr/offre-electricite-verte/",
    price_url: "https://labellenergie.fr/pdf/grille-tarifaire-la-bellenergie-particuliers.pdf",
    subscriptions: {
        3: 12.83,
        6: 16.57,
        9: 20.50,
        12: 24.43,
        15: 28.16,
        18: 31.87,
        24: 39.89,
        30: 47.55,
        36: 55.39
    },
    dayTypes: { bleu: { price: 17.91 } },
    dayRule: { type: "constant", dayType: "bleu" }
});
