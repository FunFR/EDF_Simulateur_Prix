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
    dayTypes: { bleu: { price: 16.464 } },
    priceOverrides: {
        3: { bleu: { price: 16.573 } },
        6: { bleu: { price: 16.573 } }
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
        6: 15.83,
        9: 19.84,
        12: 23.68,
        15: 27.30,
        18: 31.03,
        24: 38.96,
        30: 46.28,
        36: 53.63
    },
    dayTypes: { bleu: { HP: 17.596, HC: 13.610 } },
    dayRule: { type: "constant", dayType: "bleu" },
    hcRanges: "custom"
});
