defineTarif({
    name: "Alterna - Heures Creuses Locale",
    offer_type: "Marché",
    lastUpdate: "2026-05-07",
    isCommunity: true,
    subscription_url: "https://www.alterna-energie.fr",
    price_url: "https://www.alterna-energie.fr/tarifs-electricite-locale",
    subscriptions: {
        6: 15.05,
        9: 19.19,
        12: 23.01,
        15: 26.63,
        18: 30.35,
        24: 38.25,
        30: 45.55,
        36: 52.91
    },
    dayTypes: { bleu: { HP: 18.85, HC: 14.93 } },
    dayRule: { type: "constant", dayType: "bleu" },
    hcRanges: "custom"
});
