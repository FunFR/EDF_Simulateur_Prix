defineTarif({
    name: "Engie - Elec Tranquillité 1 an",
    offer_type: "Marché",
    lastUpdate: "2024-11-01",
    isCommunity: true,
    subscription_url: "https://particuliers.engie.fr/electricite.html",
    price_url: "https://particuliers.engie.fr/content/dam/pdf/fiches-descriptives/fiche-descriptive-elec-tranquillite.pdf",
    subscriptions: {
        3: 116.97 / 12,
        6: 153.59 / 12,
        9: 192.86 / 12,
        12: 232.90 / 12,
        15: 270.28 / 12,
        18: 307.40 / 12,
        24: 389.50 / 12,
        30: 459.69 / 12,
        36: 542.17 / 12
    },
    dayTypes: { bleu: { price: 26.119 } },
    dayRule: { type: "constant", dayType: "bleu" }
});

defineTarif({
    name: "Engie - Elec Tranquillité 1 an HC",
    offer_type: "Marché",
    lastUpdate: "2024-11-01",
    isCommunity: true,
    subscription_url: "https://particuliers.engie.fr/electricite.html",
    price_url: "https://particuliers.engie.fr/content/dam/pdf/fiches-descriptives/fiche-descriptive-elec-tranquillite.pdf",
    subscriptions: {
        6: 161.69 / 12,
        9: 205.33 / 12,
        12: 247.96 / 12,
        15: 288.70 / 12,
        18: 329.05 / 12,
        24: 413.68 / 12,
        30: 490.96 / 12,
        36: 568.88 / 12
    },
    dayTypes: { bleu: { HP: 28.033, HC: 21.442 } },
    dayRule: { type: "constant", dayType: "bleu" },
    hcRanges: [{ from: "22:00", to: "24:00" }, { from: "00:00", to: "06:00" }]
});
