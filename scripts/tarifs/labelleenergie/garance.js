defineTarif({
    name: "La Belle Energie - Garance",
    offer_type: "Marché",
    lastUpdate: "2026-07-01",
    isCommunity: true,
    subscription_url: "https://labellenergie.fr/offre-electricite-verte/",
    price_url: "https://labellenergie.fr/pdf/grille-tarifaire-la-bellenergie-particuliers.pdf",
    subscriptions: {
        3: 16.13,
        6: 19.76,
        9: 23.67,
        12: 27.42,
        15: 30.95,
        18: 34.6,
        24: 42.35,
        30: 49.47,
        36: 56.65
    },
    dayTypes: { bleu: { price: 17.26 } },
    priceOverrides: {
        3: { bleu: { price: 17.38 } },
        6: { bleu: { price: 17.38 } }
    },
    dayRule: { type: "constant", dayType: "bleu" }
});
