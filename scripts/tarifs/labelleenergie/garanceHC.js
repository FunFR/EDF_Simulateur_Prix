defineTarif({
    name: "La Belle Energie - Garance HC",
    offer_type: "Marché",
    lastUpdate: "2026-07-01",
    isCommunity: true,
    subscription_url: "https://labellenergie.fr/offre-electricite-verte/",
    price_url: "https://labellenergie.fr/pdf/grille-tarifaire-la-bellenergie-particuliers.pdf",
    subscriptions: {
        6: 19.76,
        9: 23.94,
        12: 27.78,
        15: 31.4,
        18: 35.14,
        24: 43.07,
        30: 50.38,
        36: 57.73
    },
    dayTypes: { bleu: { HP: 18.47, HC: 14.24 } },
    dayRule: { type: "constant", dayType: "bleu" },
    hcRanges: [{ from: "22:00", to: "24:00" }, { from: "00:00", to: "06:00" }]
});
