defineTarif({
    name: "TotalEnergie - Offre verte fixe",
    offer_type: "Marché",
    lastUpdate: "2026-04-30",
    isCommunity: true,
    subscription_url: "https://www.totalenergies.fr/particuliers/electricite/offres-d-electricite/offre-heures-eco-electricite",
    price_url: "https://www.totalenergies.fr/fileadmin/Digital/Documents-contractuels/GT/grille-tarifaire-verte-fixe-particuliers.pdf",
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
    dayTypes: { bleu: { price: 19.89 } },
    // 3 et 6 kVA ont un prix du kWh plus élevé
    priceOverrides: { 3: { bleu: { price: 20.03 } }, 6: { bleu: { price: 20.03 } } },
    dayRule: { type: "constant", dayType: "bleu" }
});
