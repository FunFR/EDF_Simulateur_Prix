defineTarif({
    name: "Mint Energie - Classic & Green",
    offer_type: "Marché",
    lastUpdate: "2025-08-01",
    isCommunity: true,
    subscription_url: "https://www.mint-energie.com/Pages/Informations/tarifs_elec.aspx",
    price_url: "https://doc.mint-energie.com/MintEnergie/MINT_ENERGIE_Fiche_Tarifs_23012_CLASSIC_GREEN.pdf",
    subscriptions: {
        3: 13.52,
        6: 15.98,
        9: 17.25,
        12: 22.11,
        15: 25.78,
        18: 29.44,
        24: 37.97,
        30: 45.90,
        36: 53.23
    },
    dayTypes: { bleu: { price: 19.52 } },
    dayRule: { type: "constant", dayType: "bleu" }
});
