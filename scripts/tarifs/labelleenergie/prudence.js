defineTarif({
    name: "La Belle Energie - Prudence",
    offer_type: "Marché",
    lastUpdate: "2026-08-01",
    isCommunity: true,
    subscription_url: "https://labellenergie.fr/offre-electricite-verte/",
    price_url: "https://labellenergie.fr/pdf/grille-tarifaire-la-bellenergie-particuliers.pdf",
    subscriptions: {
        3: 11.63,
        6: 15.36,
        9: 19.38,
        12: 23.26,
        15: 26.89,
        18: 30.64,
        24: 38.63,
        30: 45.96,
        36: 53.37
    },
    dayTypes: { bleu: { price: 19.53 } },
    priceOverrides: {
        3: { bleu: { price: 19.68 } },
        6: { bleu: { price: 19.68 } }
    },
    dayRule: { type: "constant", dayType: "bleu" }
});
