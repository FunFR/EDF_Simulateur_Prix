defineTarif({
    name: "La Belle Energie - Constance",
    offer_type: "Marché",
    lastUpdate: "2026-07-01",
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
    dayTypes: { bleu: { price: 17.26 } },
    priceOverrides: {
        3: { bleu: { price: 17.38 } },
        6: { bleu: { price: 17.38 } }
    },
    dayRule: { type: "constant", dayType: "bleu" }
});
