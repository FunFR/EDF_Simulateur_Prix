defineTarif({
    name: "La Belle Energie - Garance HC",
    offer_type: "Marché",
    lastUpdate: "2025-11-01",
    isCommunity: true,
    subscription_url: "https://labellenergie.fr/offre-electricite-verte/",
    price_url: "https://labellenergie.fr/pdf/grille-tarifaire-la-bellenergie-particuliers.pdf",
    subscriptions: {
        6: 17.84,
        9: 22.31,
        12: 26.38,
        15: 30.25,
        18: 34.23,
        24: 42.63,
        30: 50.44,
        36: 58.30
    },
    dayTypes: { bleu: { HP: 19.07, HC: 15.07 } },
    dayRule: { type: "constant", dayType: "bleu" },
    hcRanges: [{ from: "22:00", to: "24:00" }, { from: "00:00", to: "06:00" }]
});
