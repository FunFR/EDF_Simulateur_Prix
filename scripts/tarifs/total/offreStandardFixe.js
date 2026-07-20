defineTarif({
    name: "TotalEnergie - Offre standard fixe",
    offer_type: "Marché",
    lastUpdate: "2026-07-02",
    isCommunity: true,
    subscription_url: "https://www.totalenergies.fr/particuliers/electricite/offres-d-electricite/offre-standard-fixe-electricite",
    price_url: "https://www.totalenergies.fr/fileadmin/Digital/Groupe/PDF/Documents_contractuels/Particuliers/Tarifs_TotalEnergies/fr/grille-tarifaire-standard-fixe-particuliers.pdf",
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
    dayTypes: { bleu: { price: 19.58 } },
    // 3 et 6 kVA ont un prix du kWh plus élevé
    priceOverrides: { 3: { bleu: { price: 19.71 } }, 6: { bleu: { price: 19.71 } } },
    dayRule: { type: "constant", dayType: "bleu" }
});
