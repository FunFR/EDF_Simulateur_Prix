defineTarif({
    name: "TotalEnergie - Heures Eco",
    offer_type: "Marché",
    lastUpdate: "2026-08-01",
    isCommunity: true,
    subscription_url: "https://www.totalenergies.fr/particuliers/electricite/offres-d-electricite/offre-heures-eco-electricite",
    price_url: "https://www.totalenergies.fr/fileadmin/Digital/Groupe/PDF/Documents_contractuels/Particuliers/Tarifs_TotalEnergies/fr/grille-tarifaire-heures-eco-particuliers.pdf",
    subscriptions: {
        3: 12.13,
        6: 15.86,
        9: 19.88,
        12: 23.76,
        15: 27.4,
        18: 31.41,
        24: 39.49,
        30: 46.92,
        36: 54.41
    },
    dayTypes: { bleu: { price: 19.85 } },
    // 3 et 6 kVA ont un prix du kWh plus élevé
    priceOverrides: { 3: { bleu: { price: 20.01 } }, 6: { bleu: { price: 20.01 } } },
    dayRule: { type: "constant", dayType: "bleu" }
});
