defineTarif({
    name: "La Belle Energie - Constance",
    offer_type: "Marché",
    lastUpdate: "2026-08-01",
    isCommunity: true,
    subscription_url: "https://labellenergie.fr/offre-electricite-verte/",
    price_url: "https://labellenergie.fr/pdf/grille-tarifaire-la-bellenergie-particuliers.pdf",
    subscriptions: {
        3: 14.13,
        6: 17.87,
        9: 21.89,
        12: 25.77,
        15: 29.4,
        18: 33.15,
        24: 41.14,
        30: 48.47,
        36: 55.88
    },
    dayTypes: { bleu: { price: 19.53 } },
    priceOverrides: {
        3: { bleu: { price: 19.68 } },
        6: { bleu: { price: 19.68 } }
    },
    dayRule: { type: "constant", dayType: "bleu" }
});
