defineTarif({
    name: "La Belle Energie - Constance HC",
    offer_type: "Marché",
    lastUpdate: "2025-11-01",
    isCommunity: true,
    subscription_url: "https://labellenergie.fr/offre-electricite-verte/",
    price_url: "https://labellenergie.fr/pdf/grille-tarifaire-la-bellenergie-particuliers.pdf",
    subscriptions: {
        6: 16.85,
        9: 21.32,
        12: 25.39,
        15: 29.26,
        18: 33.24,
        24: 41.64,
        30: 49.45,
        36: 57.31
    },
    dayTypes: { bleu: { HP: 19.07, HC: 15.07 } },
    dayRule: { type: "constant", dayType: "bleu" },
    hcRanges: [{ from: "22:00", to: "24:00" }, { from: "00:00", to: "06:00" }]
});
