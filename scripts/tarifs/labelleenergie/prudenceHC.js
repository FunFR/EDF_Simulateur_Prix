defineTarif({
    name: "La Belle Energie - Prudence HC",
    offer_type: "Marché",
    lastUpdate: "2026-07-01",
    isCommunity: true,
    subscription_url: "https://labellenergie.fr/offre-electricite-verte/",
    price_url: "https://labellenergie.fr/pdf/grille-tarifaire-la-bellenergie-particuliers.pdf",
    subscriptions: {
        6: 14.75,
        9: 18.93,
        12: 22.78,
        15: 26.40,
        18: 30.13,
        24: 38.06,
        30: 45.37,
        36: 52.73
    },
    dayTypes: { bleu: { HP: 18.47, HC: 14.24 } },
    dayRule: { type: "constant", dayType: "bleu" },
    hcRanges: [{ from: "22:00", to: "24:00" }, { from: "00:00", to: "06:00" }]
});
