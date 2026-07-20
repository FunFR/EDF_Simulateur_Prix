defineTarif({
    name: "La Belle Energie - Prudence",
    offer_type: "Marché",
    lastUpdate: "2026-07-01",
    isCommunity: true,
    subscription_url: "https://labellenergie.fr/offre-electricite-verte/",
    price_url: "https://labellenergie.fr/pdf/grille-tarifaire-la-bellenergie-particuliers.pdf",
    subscriptions: {
        3: 11.13,
        6: 14.75,
        9: 18.66,
        12: 22.42,
        15: 25.94,
        18: 29.59,
        24: 37.34,
        30: 44.47,
        36: 51.64
    },
    dayTypes: { bleu: { price: 17.26 } },
    priceOverrides: {
        3: { bleu: { price: 17.38 } },
        6: { bleu: { price: 17.38 } }
    },
    dayRule: { type: "constant", dayType: "bleu" }
});
