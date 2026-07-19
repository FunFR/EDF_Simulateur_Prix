defineTarif({
    name: "Gaz de Bordeaux - NovaFlex - base",
    offer_type: "TRV",
    lastUpdate: "2026-01-03",
    isCommunity: true,
    subscription_url: "https://www.gazdebordeaux.fr/nos-offres-d-energie/electricite/offre-electricite-verte-prix-indexe",
    price_url: "https://www.gazdebordeaux.fr/nos-offres-d-energie/electricite/offre-electricite-verte-prix-indexe",
    subscriptions: {
        3: 11.72,
        6: 15.46,
        9: 19.39,
        12: 23.33,
        15: 27.06
    },
    dayTypes: { bleu: { price: 18.726 } },
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
        6: 16.01,
        9: 20.21,
        12: 24.28,
        15: 28.16,
        18: 32.14,
        24: 40.52,
        30: 48.34,
        36: 56.20
    },
    dayTypes: { bleu: { HP: 19.945, HC: 15.716 } },
    dayRule: { type: "constant", dayType: "bleu" },
    hcRanges: "custom"
});
