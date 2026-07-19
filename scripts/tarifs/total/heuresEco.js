defineTarif({
    name: "TotalEnergie - Heures Eco",
    offer_type: "Marché",
    lastUpdate: "2025-10-01",
    isCommunity: true,
    subscription_url: "https://www.totalenergies.fr/particuliers/electricite/offres-d-electricite/offre-heures-eco-electricite",
    price_url: "https://www.totalenergies.fr/fileadmin/Digital/Groupe/PDF/Documents_contractuels/Particuliers/Tarifs_TotalEnergies/fr/grille-tarifaire-heures-eco-particuliers.pdf",
    subscriptions: {
        3: 11.73,
        6: 15.47,
        9: 19.39,
        12: 23.32,
        15: 27.06,
        18: 31.14,
        24: 39.29,
        30: 47.07,
        36: 55.05
    },
    dayTypes: { bleu: { price: 19.52 } },
    dayRule: { type: "constant", dayType: "bleu" }
});
