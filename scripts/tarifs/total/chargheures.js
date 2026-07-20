defineTarif({
    name: "TotalEnergie - Charge'Heures",
    offer_type: "Marché",
    lastUpdate: "2026-07-01",
    isCommunity: true,
    subscription_url: "https://www.totalenergies.fr/particuliers/electricite/offres-d-electricite/offre-charge-heures",
    price_url: "https://www.totalenergies.fr/fileadmin/Digital/Groupe/PDF/Documents_contractuels/Particuliers/Tarifs_TotalEnergies/fr/grille-tarifaire-charge-heures-particuliers.pdf",
    subscriptions: {
        6: 15.65,
        7: 16.96,
        8: 18.26,
        9: 19.83,
        10: 21.12,
        11: 22.41,
        12: 23.93,
        13: 25.15,
        14: 26.37,
        15: 27.61,
        16: 28.88,
        17: 30.15,
        18: 31.03,
        19: 32.36,
        20: 33.68,
        21: 35,
        22: 36.32,
        23: 37.64,
        24: 38.97,
        25: 40.18,
        26: 41.39,
        27: 42.61,
        28: 43.82,
        29: 45.03,
        30: 46.27,
        31: 47.5,
        32: 48.72,
        33: 49.95,
        34: 51.18,
        35: 52.4,
        36: 52.54
    },
    // Les heures super creuses (2h-6h) n'ont qu'un prix : elles sont
    // entièrement couvertes par les plages HC ci-dessous.
    dayTypes: {
        base: { HP: 23.05, HC: 15.79 },
        hsc: { price: 13.37 }
    },
    dayRule: {
        type: "constant",
        dayType: "base",
        hourSubTypes: [{ fromHour: 2, toHour: 6, dayType: "hsc" }]
    },
    hcRanges: [{ from: "23:00", to: "24:00" }, { from: "00:00", to: "07:00" }]
});
