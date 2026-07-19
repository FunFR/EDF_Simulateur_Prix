defineTarif({
    name: "La Belle Energie - Garance",
    offer_type: "Marché",
    lastUpdate: "2026-05-07",
    isCommunity: true,
    subscription_url: "https://labellenergie.fr/offre-electricite-verte/",
    price_url: "https://labellenergie.fr/pdf/grille-tarifaire-la-bellenergie-particuliers.pdf",
    subscriptions: {
        3: 14.13,
        6: 17.75,
        9: 21.66,
        12: 25.42,
        15: 28.94,
        18: 32.59,
        24: 40.34,
        30: 47.47,
        36: 54.64
    },
    dayTypes: { bleu: { price: 17.08 } },
    priceOverrides: {
        3: { bleu: { price: 17.20 } },
        6: { bleu: { price: 17.20 } }
    },
    dayRule: { type: "constant", dayType: "bleu" }
});
