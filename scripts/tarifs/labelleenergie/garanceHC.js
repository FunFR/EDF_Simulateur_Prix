defineTarif({
    name: "La Belle Energie - Garance HC",
    offer_type: "Marché",
    lastUpdate: "2026-08-01",
    isCommunity: true,
    subscription_url: "https://labellenergie.fr/offre-electricite-verte/",
    price_url: "https://labellenergie.fr/pdf/grille-tarifaire-la-bellenergie-particuliers.pdf",
    subscriptions: {
        6: 20.36,
        9: 24.66,
        12: 28.63,
        15: 32.36,
        18: 36.2,
        24: 44.38,
        30: 51.9,
        36: 59.49
    },
    dayTypes: { bleu: { HP: 21.06, HC: 15.65 } },
    dayRule: { type: "constant", dayType: "bleu" },
    hcRanges: [{ from: "22:00", to: "24:00" }, { from: "00:00", to: "06:00" }]
});
