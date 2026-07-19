defineTarif({
    name: "TotalEnergie - Charge'Heures",
    offer_type: "Marché",
    lastUpdate: "2025-10-01",
    isCommunity: true,
    subscription_url: "https://www.totalenergies.fr/particuliers/electricite/offres-d-electricite/offre-charge-heures",
    price_url: "https://www.totalenergies.fr/fileadmin/Digital/Groupe/PDF/Documents_contractuels/Particuliers/Tarifs_TotalEnergies/fr/grille-tarifaire-charge-heures-particuliers.pdf",
    subscriptions: {
        6: 15.96,
        7: 17.34,
        8: 18.73,
        9: 20.52,
        10: 21.92,
        11: 23.31,
        12: 25.08,
        13: 26.43,
        14: 27.78,
        15: 29.13,
        16: 30.52,
        17: 31.91,
        18: 32.77,
        19: 34.20,
        20: 35.63,
        21: 37.06,
        22: 38.49,
        23: 39.92,
        24: 41.32,
        25: 42.61,
        26: 43.89,
        27: 45.18,
        28: 46.47,
        29: 47.75,
        30: 49.06,
        31: 50.38,
        32: 51.70,
        33: 53.03,
        34: 54.35,
        35: 55.67,
        36: 55.43
    },
    // Les heures super creuses (2h-6h) n'ont qu'un prix : elles sont
    // entièrement couvertes par les plages HC ci-dessous.
    dayTypes: {
        base: { HP: 21.62, HC: 16.51 },
        hsc: { price: 12.61 }
    },
    dayRule: {
        type: "constant",
        dayType: "base",
        hourSubTypes: [{ fromHour: 2, toHour: 6, dayType: "hsc" }]
    },
    hcRanges: [{ from: "23:00", to: "24:00" }, { from: "00:00", to: "07:00" }]
});
