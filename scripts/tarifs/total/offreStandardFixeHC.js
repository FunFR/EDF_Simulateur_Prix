defineTarif({
    name: "TotalEnergie - Offre standard fixe HC",
    offer_type: "Marché",
    lastUpdate: "2025-08-05",
    isCommunity: true,
    subscription_url: "https://www.totalenergies.fr/particuliers/electricite/offres-d-electricite/offre-standard-fixe-electricite",
    price_url: "https://www.totalenergies.fr/fileadmin/Digital/Groupe/PDF/Documents_contractuels/Particuliers/Tarifs_TotalEnergies/fr/grille-tarifaire-standard-fixe-particuliers.pdf",
    subscriptions: {
        6: 18.47,
        9: 23.39,
        12: 28.17,
        15: 32.14,
        18: 37.38,
        24: 47.15,
        30: 56.00,
        36: 65.08
    },
    dayTypes: { bleu: { HP: 20.14, HC: 15.86 } },
    dayRule: { type: "constant", dayType: "bleu" },
    hcRanges: [{ from: "22:00", to: "24:00" }, { from: "00:00", to: "06:00" }]
});
