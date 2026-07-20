defineTarif({
    name: "Gaz de Bordeaux - NovaFixe - base",
    offer_type: "Marché",
    lastUpdate: "2026-02-04",
    isCommunity: true,
    subscription_url: "https://www.gazdebordeaux.fr/nos-offres-d-energie/electricite/offre-electricite-prix-fixe-2-ans",
    price_url: "https://www.gazdebordeaux.fr/nos-offres-d-energie/electricite/offre-electricite-prix-fixe-2-ans",
    subscriptions: {
        3: 12.02,
        6: 15.65,
        9: 19.56,
        12: 23.32,
        15: 26.85
    },
    dayTypes: { bleu: { price: 16.776 } },
    priceOverrides: {
        3: { bleu: { price: 16.886 } },
        6: { bleu: { price: 16.886 } }
    },
    dayRule: { type: "constant", dayType: "bleu" }
});

defineTarif({
    name: "Gaz de Bordeaux - NovaFixe - heures creuses",
    offer_type: "Marché",
    lastUpdate: "2026-02-04",
    isCommunity: true,
    subscription_url: "https://www.gazdebordeaux.fr/nos-offres-d-energie/electricite/offre-electricite-prix-fixe-2-ans",
    price_url: "https://www.gazdebordeaux.fr/nos-offres-d-energie/electricite/offre-electricite-prix-fixe-2-ans",
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
    dayTypes: { bleu: { HP: 17.935, HC: 13.853 } },
    dayRule: { type: "constant", dayType: "bleu" },
    hcRanges: "custom"
});
