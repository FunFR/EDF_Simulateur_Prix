defineTarif({
    name: "TotalEnergie - HeuresEco HC",
    offer_type: "Marché",
    lastUpdate: "2026-08-01",
    isCommunity: true,
    subscription_url: "https://www.totalenergies.fr/particuliers/electricite/offres-d-electricite/offre-heures-eco-electricite",
    price_url: "https://www.totalenergies.fr/fileadmin/Digital/Groupe/PDF/Documents_contractuels/Particuliers/Tarifs_TotalEnergies/fr/grille-tarifaire-heures-eco-particuliers.pdf",
    subscriptions: {
        6: 15.86,
        9: 20.16,
        12: 24.39,
        15: 28.18,
        18: 31.7,
        24: 39.88,
        30: 47.4,
        36: 53.88
    },
    dayTypes: { bleu: { HP: 21.42, HC: 15.89 } },
    dayRule: { type: "constant", dayType: "bleu" },
    hcRanges: [{ from: "22:00", to: "24:00" }, { from: "00:00", to: "06:00" }]
});
