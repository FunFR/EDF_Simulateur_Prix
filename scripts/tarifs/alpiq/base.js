defineTarif({
    name: "Alpiq - Base",
    offer_type: "Marché",
    lastUpdate: "2026-06-12",
    isCommunity: true,
    subscription_url: "https://particuliers.alpiq.fr/electricite/nos-tarifs",
    price_url: "https://particuliers.alpiq.fr/grille-tarifaire/particuliers/gtr_elec_part.pdf",
    subscriptions: {
        3: 12.03,
        6: 15.65,
        9: 19.56,
        12: 23.32,
        15: 26.84,
        18: 30.49,
        24: 38.24,
        30: 45.37,
        36: 52.54
    },
    // HP = HC mais les plages HC restent saisies par l'utilisateur :
    // la répartition HC/HP affichée dépend de ses réglages.
    dayTypes: { bleu: { HP: 17.3983, HC: 17.3983 } },
    // 3 kVA a un prix du kWh plus élevé (la grille majore 3/4/5 kVA, pas le 6)
    priceOverrides: { 3: { bleu: { HP: 17.5145, HC: 17.5145 } } },
    dayRule: { type: "constant", dayType: "bleu" },
    hcRanges: "custom"
});

defineTarif({
    name: "Alpiq - Heures Creuses",
    offer_type: "Marché",
    lastUpdate: "2026-06-12",
    isCommunity: true,
    subscription_url: "https://particuliers.alpiq.fr/electricite/nos-tarifs",
    price_url: "https://particuliers.alpiq.fr/grille-tarifaire/particuliers/gtr_elec_part.pdf",
    subscriptions: {
        6: 15.65,
        9: 19.56,
        12: 23.32,
        15: 26.84,
        18: 30.49,
        24: 38.24,
        30: 45.37,
        36: 52.54
    },
    dayTypes: { bleu: { HP: 18.6127, HC: 14.3359 } },
    dayRule: { type: "constant", dayType: "bleu" },
    hcRanges: "custom"
});
