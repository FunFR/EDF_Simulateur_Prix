defineTarif({
    name: "Gaz de Bordeaux - NovaFlex - base",
    offer_type: "TRV",
    lastUpdate: "2026-01-03",
    isCommunity: true,
    subscription_url: "https://www.gazdebordeaux.fr/nos-offres-d-energie/electricite/offre-electricite-verte-prix-indexe",
    price_url: "https://www.gazdebordeaux.fr/nos-offres-d-energie/electricite/offre-electricite-verte-prix-indexe",
    subscriptions: {
        3: 12.02,
        6: 15.65,
        9: 19.56,
        12: 23.32,
        15: 26.85
    },
    dayTypes: { bleu: { price: 18.613 } },
    dayRule: { type: "constant", dayType: "bleu" }
});

defineTarif({
    name: "Gaz de Bordeaux - NovaFlex - heures creuses",
    offer_type: "TRV",
    lastUpdate: "2026-01-03",
    isCommunity: true,
    subscription_url: "https://www.gazdebordeaux.fr/nos-offres-d-energie/electricite/offre-electricite-verte-prix-indexe",
    price_url: "https://www.gazdebordeaux.fr/nos-offres-d-energie/electricite/offre-electricite-verte-prix-indexe",
    subscriptions: {
        6: 15.65,
        9: 19.56,
        12: 23.32,
        15: 26.85,
        18: 30.49,
        24: 38.24,
        30: 45.38,
        36: 52.54
    },
    dayTypes: { bleu: { HP: 19.799, HC: 15.182 } },
    dayRule: { type: "constant", dayType: "bleu" },
    hcRanges: "custom"
});
