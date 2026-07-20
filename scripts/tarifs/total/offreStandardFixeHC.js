defineTarif({
    name: "TotalEnergie - Offre standard fixe HC",
    offer_type: "Marché",
    lastUpdate: "2026-07-02",
    isCommunity: true,
    subscription_url: "https://www.totalenergies.fr/particuliers/electricite/offres-d-electricite/offre-standard-fixe-electricite",
    price_url: "https://www.totalenergies.fr/fileadmin/Digital/Groupe/PDF/Documents_contractuels/Particuliers/Tarifs_TotalEnergies/fr/grille-tarifaire-standard-fixe-particuliers.pdf",
    subscriptions: {
        6: 15.83,
        9: 19.83,
        12: 23.68,
        15: 27.3,
        18: 31.03,
        24: 38.97,
        30: 46.27,
        36: 53.63
    },
    dayTypes: { bleu: { HP: 20.99, HC: 16.03 } },
    dayRule: { type: "constant", dayType: "bleu" },
    hcRanges: [{ from: "22:00", to: "24:00" }, { from: "00:00", to: "06:00" }]
});
