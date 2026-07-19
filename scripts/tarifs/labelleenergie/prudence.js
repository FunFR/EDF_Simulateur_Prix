defineTarif({
    name: "La Belle Energie - Prudence",
    offer_type: "Marché",
    lastUpdate: "2025-11-01",
    isCommunity: true,
    subscription_url: "https://labellenergie.fr/offre-electricite-verte/",
    price_url: "https://labellenergie.fr/pdf/grille-tarifaire-la-bellenergie-particuliers.pdf",
    subscriptions: {
        3: 10.83,
        6: 14.57,
        9: 18.50,
        12: 22.42,
        15: 26.16,
        18: 29.86,
        24: 37.89,
        30: 45.54,
        36: 53.39
    },
    dayTypes: { bleu: { price: 17.91 } },
    dayRule: { type: "constant", dayType: "bleu" }
});
