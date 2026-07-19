defineTarif({
    name: "La Belle Energie - Garance",
    offer_type: "Marché",
    lastUpdate: "2025-11-01",
    isCommunity: true,
    subscription_url: "https://labellenergie.fr/offre-electricite-verte/",
    price_url: "https://labellenergie.fr/pdf/grille-tarifaire-la-bellenergie-particuliers.pdf",
    subscriptions: {
        3: 13.83,
        6: 17.57,
        9: 21.50,
        12: 25.42,
        15: 29.16,
        18: 32.86,
        24: 40.89,
        30: 48.54,
        36: 56.39
    },
    dayTypes: { bleu: { price: 17.91 } },
    dayRule: { type: "constant", dayType: "bleu" }
});
