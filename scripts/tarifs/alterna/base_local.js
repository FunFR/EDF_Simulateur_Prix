defineTarif({
    name: "Alterna - Base Locale",
    offer_type: "Marché",
    lastUpdate: "2025-12-18",
    isCommunity: true,
    subscription_url: "https://www.alterna-energie.fr",
    price_url: "https://www.alterna-energie.fr/tarifs-electricite-locale",
    subscriptions: {
        3: 11.73,
        6: 15.47,
        9: 19.39,
        12: 23.32,
        15: 27.06,
        18: 30.76,
        24: 38.79,
        30: 46.44,
        36: 54.29
    },
    dayTypes: { bleu: { price: 17.61 } },
    dayRule: { type: "constant", dayType: "bleu" }
});
