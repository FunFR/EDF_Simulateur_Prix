defineTarif({
    name: "TotalEnergie - Offre verte fixe",
    offer_type: "Marché",
    lastUpdate: "2025-08-05",
    isCommunity: true,
    subscription_url: "https://www.totalenergies.fr/particuliers/electricite/offres-d-electricite/offre-heures-eco-electricite",
    price_url: "https://www.totalenergies.fr/fileadmin/Digital/Documents-contractuels/GT/grille-tarifaire-verte-fixe-particuliers.pdf",
    subscriptions: {
        3: 13.45,
        6: 17.74,
        9: 22.34,
        12: 27.01,
        15: 31.35,
        18: 35.45,
        24: 44.95,
        30: 54.44,
        36: 62.75
    },
    dayTypes: { bleu: { price: 19.15 } },
    dayRule: { type: "constant", dayType: "bleu" }
});
