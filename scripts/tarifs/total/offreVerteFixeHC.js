defineTarif({
    name: "TotalEnergie - Offre verte fixe HC",
    offer_type: "Marché",
    lastUpdate: "2025-08-05",
    isCommunity: true,
    subscription_url: "https://www.totalenergies.fr/particuliers/electricite/offres-d-electricite/offre-heures-eco-electricite",
    price_url: "https://www.totalenergies.fr/fileadmin/Digital/Documents-contractuels/GT/grille-tarifaire-verte-fixe-particuliers.pdf",
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
    dayTypes: { bleu: { HP: 20.40, HC: 16.06 } },
    dayRule: { type: "constant", dayType: "bleu" },
    hcRanges: [{ from: "22:00", to: "24:00" }, { from: "00:00", to: "06:00" }]
});
