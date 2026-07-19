defineTarif({
    name: "Alterna - Heures Creuses",
    offer_type: "Marché",
    lastUpdate: "2025-12-18",
    isCommunity: true,
    subscription_url: "https://www.alterna-energie.fr",
    price_url: "https://www.alterna-energie.fr/tarifs-electricite-francaise",
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
    dayTypes: { bleu: { HP: 18.40, HC: 14.57 } },
    dayRule: { type: "constant", dayType: "bleu" },
    hcRanges: "custom"
});
