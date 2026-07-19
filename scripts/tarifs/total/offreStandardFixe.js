defineTarif({
    name: "TotalEnergie - Offre standard fixe",
    offer_type: "Marché",
    lastUpdate: "2025-08-05",
    isCommunity: true,
    subscription_url: "https://www.totalenergies.fr/particuliers/electricite/offres-d-electricite/offre-standard-fixe-electricite",
    price_url: "https://www.totalenergies.fr/fileadmin/Digital/Groupe/PDF/Documents_contractuels/Particuliers/Tarifs_TotalEnergies/fr/grille-tarifaire-standard-fixe-particuliers.pdf",
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
    dayTypes: { bleu: { price: 18.91 } },
    dayRule: { type: "constant", dayType: "bleu" }
});
