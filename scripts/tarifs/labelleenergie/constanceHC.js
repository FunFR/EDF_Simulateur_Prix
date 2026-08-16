defineTarif({
    name: "La Belle Energie - Constance HC",
    offer_type: "Marché",
    lastUpdate: "2026-08-01",
    isCommunity: true,
    subscription_url: "https://labellenergie.fr/offre-electricite-verte/",
    price_url: "https://labellenergie.fr/pdf/grille-tarifaire-la-bellenergie-particuliers.pdf",
    subscriptions: {
        6: 17.87,
        9: 22.17,
        12: 26.14,
        15: 29.87,
        18: 33.71,
        24: 41.89,
        30: 49.41,
        36: 57
    },
    dayTypes: { bleu: { HP: 21.06, HC: 15.65 } },
    dayRule: { type: "constant", dayType: "bleu" },
    hcRanges: [{ from: "22:00", to: "24:00" }, { from: "00:00", to: "06:00" }]
});
