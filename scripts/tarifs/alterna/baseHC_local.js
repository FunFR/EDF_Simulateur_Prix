defineTarif({
    name: "Alterna - Heures Creuses Locale",
    offer_type: "Marché",
    lastUpdate: "2025-12-18",
    isCommunity: true,
    subscription_url: "https://www.alterna-energie.fr",
    price_url: "https://www.alterna-energie.fr/tarifs-electricite-locale",
    subscriptions: {
        6: 15.74,
        9: 20.21,
        12: 24.28,
        15: 28.15,
        18: 32.13,
        24: 40.53,
        30: 48.34,
        36: 56.20
    },
    dayTypes: { bleu: { HP: 18.74, HC: 14.82 } },
    dayRule: { type: "constant", dayType: "bleu" },
    hcRanges: "custom"
});
