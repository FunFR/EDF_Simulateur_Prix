defineTarif({
    name: "Alterna - Base Locale",
    offer_type: "Marché",
    lastUpdate: "2026-05-07",
    isCommunity: true,
    subscription_url: "https://www.alterna-energie.fr",
    price_url: "https://www.alterna-energie.fr/tarifs-electricite-locale",
    subscriptions: {
        3: 11.25,
        6: 14.78,
        9: 18.49,
        12: 22.21,
        15: 25.74,
        18: 29.23,
        24: 36.84,
        30: 44.07,
        36: 51.50
    },
    dayTypes: { bleu: { price: 17.72 } },
    dayRule: { type: "constant", dayType: "bleu" }
});
