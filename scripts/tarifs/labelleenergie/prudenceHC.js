defineTarif({
    name: "La Belle Energie - Prudence HC",
    offer_type: "Marché",
    lastUpdate: "2026-08-01",
    isCommunity: true,
    subscription_url: "https://labellenergie.fr/offre-electricite-verte/",
    price_url: "https://labellenergie.fr/pdf/grille-tarifaire-la-bellenergie-particuliers.pdf",
    subscriptions: {
        6: 15.36,
        9: 19.66,
        12: 23.63,
        15: 27.36,
        18: 31.2,
        24: 39.38,
        30: 46.9,
        36: 54.49
    },
    dayTypes: { bleu: { HP: 21.06, HC: 15.65 } },
    dayRule: { type: "constant", dayType: "bleu" },
    hcRanges: [{ from: "22:00", to: "24:00" }, { from: "00:00", to: "06:00" }]
});
