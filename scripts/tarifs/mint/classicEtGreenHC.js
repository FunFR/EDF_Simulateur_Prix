defineTarif({
    name: "Mint Energie - Classic & Green HC",
    offer_type: "Marché",
    lastUpdate: "2025-08-01",
    isCommunity: true,
    subscription_url: "https://www.mint-energie.com/Pages/Informations/tarifs_elec.aspx",
    price_url: "https://doc.mint-energie.com/MintEnergie/MINT_ENERGIE_Fiche_Tarifs_23012_CLASSIC_GREEN.pdf",
    subscriptions: {
        6: 16.25,
        9: 17.64,
        12: 22.64,
        15: 26.44,
        18: 30.24,
        24: 39.03,
        30: 47.23,
        36: 54.82
    },
    dayTypes: { bleu: { HP: 20.81, HC: 16.35 } },
    dayRule: { type: "constant", dayType: "bleu" },
    hcRanges: [{ from: "22:00", to: "24:00" }, { from: "00:00", to: "06:00" }]
});
