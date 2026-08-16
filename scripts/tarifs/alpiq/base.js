defineTarif({
    name: "Alpiq - Base",
    offer_type: "Marché",
    lastUpdate: "2026-08-03",
    isCommunity: true,
    subscription_url: "https://particuliers.alpiq.fr/electricite/nos-tarifs",
    price_url: "https://particuliers.alpiq.fr/grille-tarifaire/particuliers/gtr_elec_part.pdf",
    subscriptions: {
        3: 12.13,
        6: 15.86,
        9: 19.88,
        12: 23.76,
        15: 27.4,
        18: 31.14,
        24: 39.14,
        30: 46.47,
        36: 53.88
    },
    // HP = HC mais les plages HC restent saisies par l'utilisateur :
    // la répartition HC/HP affichée dépend de ses réglages.
    dayTypes: { bleu: { HP: 18.8798, HC: 18.8798 } },
    // 3 kVA a un prix du kWh plus élevé (la grille majore 3/4/5 kVA, pas le 6)
    priceOverrides: { 3: { bleu: { HP: 19.0265, HC: 19.0265 } } },
    dayRule: { type: "constant", dayType: "bleu" },
    hcRanges: "custom"
});

defineTarif({
    name: "Alpiq - Heures Creuses",
    offer_type: "Marché",
    lastUpdate: "2026-08-03",
    isCommunity: true,
    subscription_url: "https://particuliers.alpiq.fr/electricite/nos-tarifs",
    price_url: "https://particuliers.alpiq.fr/grille-tarifaire/particuliers/gtr_elec_part.pdf",
    subscriptions: {
        6: 15.86,
        9: 19.88,
        12: 23.76,
        15: 27.4,
        18: 31.14,
        24: 39.14,
        30: 46.47,
        36: 53.88
    },
    dayTypes: { bleu: { HP: 20.3575, HC: 15.1574 } },
    dayRule: { type: "constant", dayType: "bleu" },
    hcRanges: "custom"
});
