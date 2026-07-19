defineTarif({
    name: "La Belle Energie - Prudence HC",
    offer_type: "Marché",
    lastUpdate: "2025-11-01",
    isCommunity: true,
    subscription_url: "https://labellenergie.fr/offre-electricite-verte/",
    price_url: "https://labellenergie.fr/pdf/grille-tarifaire-la-bellenergie-particuliers.pdf",
    subscriptions: {
        6: 14.84,
        9: 19.31,
        12: 23.38,
        15: 27.25,
        18: 31.23,
        24: 39.63,
        30: 47.44,
        36: 55.30
    },
    dayTypes: { bleu: { HP: 19.07, HC: 15.07 } },
    dayRule: { type: "constant", dayType: "bleu" },
    hcRanges: [{ from: "22:00", to: "24:00" }, { from: "00:00", to: "06:00" }]
});
