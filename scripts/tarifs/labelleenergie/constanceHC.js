defineTarif({
    name: "La Belle Energie - Constance HC",
    offer_type: "Marché",
    lastUpdate: "2026-05-07",
    isCommunity: true,
    subscription_url: "https://labellenergie.fr/offre-electricite-verte/",
    price_url: "https://labellenergie.fr/pdf/grille-tarifaire-la-bellenergie-particuliers.pdf",
    subscriptions: {
        6: 16.76,
        9: 20.94,
        12: 24.78,
        15: 28.40,
        18: 32.14,
        24: 40.07,
        30: 47.38,
        36: 54.73
    },
    dayTypes: { bleu: { HP: 18.27, HC: 14.09 } },
    dayRule: { type: "constant", dayType: "bleu" },
    hcRanges: [{ from: "22:00", to: "24:00" }, { from: "00:00", to: "06:00" }]
});
