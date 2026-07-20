defineTarif({
    name: "Mint Energie - Classic & Green",
    offer_type: "Marché",
    lastUpdate: "2026-02-01",
    isCommunity: true,
    subscription_url: "https://www.mint-energie.com/Pages/Informations/tarifs_elec.aspx",
    price_url: "https://doc.mint-energie.com/MintEnergie/MINT_ENERGIE_Fiche_Tarifs_23012_CLASSIC_GREEN.pdf",
    subscriptions: {
        3: 13.04,
        6: 15.29,
        9: 16.35,
        12: 21,
        15: 24.46,
        18: 27.91,
        24: 36.02,
        30: 43.53,
        36: 50.44
    },
    dayTypes: { bleu: { price: 19.63 } },
    dayRule: { type: "constant", dayType: "bleu" }
});
