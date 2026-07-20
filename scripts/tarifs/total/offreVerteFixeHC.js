defineTarif({
    name: "TotalEnergie - Offre verte fixe HC",
    offer_type: "Marché",
    lastUpdate: "2026-04-30",
    isCommunity: true,
    subscription_url: "https://www.totalenergies.fr/particuliers/electricite/offres-d-electricite/offre-heures-eco-electricite",
    price_url: "https://www.totalenergies.fr/fileadmin/Digital/Documents-contractuels/GT/grille-tarifaire-verte-fixe-particuliers.pdf",
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
    dayTypes: { bleu: { HP: 21.32, HC: 16.27 } },
    dayRule: { type: "constant", dayType: "bleu" },
    hcRanges: [{ from: "22:00", to: "24:00" }, { from: "00:00", to: "06:00" }]
});
