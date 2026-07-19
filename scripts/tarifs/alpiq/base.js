defineTarif({
    name: "Alpiq - Base",
    offer_type: "Marché",
    lastUpdate: "2025-10-24",
    isCommunity: true,
    subscription_url: "https://particuliers.alpiq.fr/electricite/nos-tarifs",
    price_url: "https://particuliers.alpiq.fr/grille-tarifaire/particuliers/gtr_elec_part.pdf",
    subscriptions: {
        3: 11.73,
        6: 15.47,
        9: 19.39,
        12: 23.32,
        15: 27.06,
        18: 30.76,
        24: 38.79,
        30: 46.44,
        36: 54.29
    },
    // HP = HC mais les plages HC restent saisies par l'utilisateur :
    // la répartition HC/HP affichée dépend de ses réglages.
    dayTypes: { bleu: { HP: 17.9292, HC: 17.9292 } },
    dayRule: { type: "constant", dayType: "bleu" },
    hcRanges: "custom"
});

defineTarif({
    name: "Alpiq - Heures Creuses",
    offer_type: "Marché",
    lastUpdate: "2025-10-24",
    isCommunity: true,
    subscription_url: "https://particuliers.alpiq.fr/electricite/nos-tarifs",
    price_url: "https://particuliers.alpiq.fr/grille-tarifaire/particuliers/gtr_elec_part.pdf",
    subscriptions: {
        6: 15.74,
        9: 19.81,
        12: 23.76,
        15: 27.49,
        18: 31.34,
        24: 39.47,
        30: 47.02,
        36: 54.61
    },
    dayTypes: { bleu: { HP: 19.0848, HC: 15.0780 } },
    dayRule: { type: "constant", dayType: "bleu" },
    hcRanges: "custom"
});
