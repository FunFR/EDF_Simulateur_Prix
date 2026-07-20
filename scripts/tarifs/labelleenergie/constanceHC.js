defineTarif({
    name: "La Belle Energie - Constance HC",
    offer_type: "Marché",
    lastUpdate: "2026-07-01",
    isCommunity: true,
    subscription_url: "https://labellenergie.fr/offre-electricite-verte/",
    price_url: "https://labellenergie.fr/pdf/grille-tarifaire-la-bellenergie-particuliers.pdf",
    subscriptions: {
        6: 17.75,
        9: 21.93,
        12: 25.78,
        15: 29.4,
        18: 33.13,
        24: 41.06,
        30: 48.37,
        36: 55.73
    },
    dayTypes: { bleu: { HP: 18.47, HC: 14.24 } },
    dayRule: { type: "constant", dayType: "bleu" },
    hcRanges: [{ from: "22:00", to: "24:00" }, { from: "00:00", to: "06:00" }]
});
