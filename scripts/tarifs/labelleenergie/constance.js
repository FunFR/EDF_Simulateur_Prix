defineTarif({
    name: "La Belle Energie - Constance",
    offer_type: "Marché",
    lastUpdate: "2026-05-07",
    isCommunity: true,
    subscription_url: "https://labellenergie.fr/offre-electricite-verte/",
    price_url: "https://labellenergie.fr/pdf/grille-tarifaire-la-bellenergie-particuliers.pdf",
    subscriptions: {
        3: 13.13,
        6: 16.76,
        9: 20.67,
        12: 24.42,
        15: 27.95,
        18: 31.60,
        24: 39.35,
        30: 46.47,
        36: 53.65
    },
    dayTypes: { bleu: { price: 17.08 } },
    priceOverrides: {
        3: { bleu: { price: 17.20 } },
        6: { bleu: { price: 17.20 } }
    },
    dayRule: { type: "constant", dayType: "bleu" }
});
