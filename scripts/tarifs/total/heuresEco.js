defineTarif({
    name: "TotalEnergie - Heures Eco",
    offer_type: "Marché",
    lastUpdate: "2026-07-01",
    isCommunity: true,
    subscription_url: "https://www.totalenergies.fr/particuliers/electricite/offres-d-electricite/offre-heures-eco-electricite",
    price_url: "https://www.totalenergies.fr/fileadmin/Digital/Groupe/PDF/Documents_contractuels/Particuliers/Tarifs_TotalEnergies/fr/grille-tarifaire-heures-eco-particuliers.pdf",
    subscriptions: {
        3: 12.03,
        6: 15.65,
        9: 19.56,
        12: 23.32,
        15: 26.84,
        18: 30.75,
        24: 38.59,
        30: 45.8,
        36: 53.06
    },
    dayTypes: { bleu: { price: 19.27 } },
    // 3 et 6 kVA ont un prix du kWh plus élevé
    priceOverrides: { 3: { bleu: { price: 19.40 } }, 6: { bleu: { price: 19.40 } } },
    dayRule: { type: "constant", dayType: "bleu" }
});
