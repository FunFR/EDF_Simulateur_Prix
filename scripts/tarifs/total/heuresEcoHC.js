defineTarif({
    name: "TotalEnergie - HeuresEco HC",
    offer_type: "Marché",
    lastUpdate: "2026-07-01",
    isCommunity: true,
    subscription_url: "https://www.totalenergies.fr/particuliers/electricite/offres-d-electricite/offre-heures-eco-electricite",
    price_url: "https://www.totalenergies.fr/fileadmin/Digital/Groupe/PDF/Documents_contractuels/Particuliers/Tarifs_TotalEnergies/fr/grille-tarifaire-heures-eco-particuliers.pdf",
    subscriptions: {
        6: 15.65,
        9: 19.83,
        12: 23.93,
        15: 27.61,
        18: 31.03,
        24: 38.97,
        30: 46.27,
        36: 52.54
    },
    dayTypes: { bleu: { HP: 20.65, HC: 15.79 } },
    dayRule: { type: "constant", dayType: "bleu" },
    hcRanges: [{ from: "22:00", to: "24:00" }, { from: "00:00", to: "06:00" }]
});
