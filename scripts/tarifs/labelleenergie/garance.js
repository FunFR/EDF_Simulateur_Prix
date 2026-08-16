defineTarif({
    name: "La Belle Energie - Garance",
    offer_type: "Marché",
    lastUpdate: "2026-08-01",
    isCommunity: true,
    subscription_url: "https://labellenergie.fr/offre-electricite-verte/",
    price_url: "https://labellenergie.fr/pdf/grille-tarifaire-la-bellenergie-particuliers.pdf",
    subscriptions: {
        3: 16.63,
        6: 20.36,
        9: 24.38,
        12: 28.26,
        15: 31.9,
        18: 35.64,
        24: 43.64,
        30: 50.97,
        36: 58.38
    },
    dayTypes: { bleu: { price: 19.53 } },
    priceOverrides: {
        3: { bleu: { price: 19.68 } },
        6: { bleu: { price: 19.68 } }
    },
    dayRule: { type: "constant", dayType: "bleu" }
});
