defineTarif({
    name: "TotalEnergie - HeuresEco HC",
    offer_type: "Marché",
    lastUpdate: "2025-10-01",
    isCommunity: true,
    subscription_url: "https://www.totalenergies.fr/particuliers/electricite/offres-d-electricite/offre-heures-eco-electricite",
    price_url: "https://www.totalenergies.fr/fileadmin/Digital/Groupe/PDF/Documents_contractuels/Particuliers/Tarifs_TotalEnergies/fr/grille-tarifaire-heures-eco-particuliers.pdf",
    subscriptions: {
        6: 15.74,
        9: 20.21,
        12: 24.64,
        15: 28.60,
        18: 32.13,
        24: 40.53,
        30: 48.34,
        36: 56.20
    },
    dayTypes: { bleu: { HP: 20.81, HC: 16.35 } },
    dayRule: { type: "constant", dayType: "bleu" },
    hcRanges: [{ from: "22:00", to: "24:00" }, { from: "00:00", to: "06:00" }]
});
