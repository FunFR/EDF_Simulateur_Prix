defineTarif({
    name: "Mint Energie - Online & Green",
    offer_type: "Marché",
    lastUpdate: "2025-08-01",
    isCommunity: true,
    subscription_url: "https://www.mint-energie.com/Pages/Informations/tarifs_elec.aspx",
    price_url: "https://doc.mint-energie.com/MintEnergie/MINT_ENERGIE_Fiche_Tarifs_21912_ONLINE_GREEN.pdf",
    subscriptions: {
        3: 11.73,
        6: 15.47,
        9: 19.39,
        12: 23.32,
        15: 27.06,
        18: 30.76,
        24: 38.79,
        30: 46.44,
        36: 54.29
    },
    dayTypes: { bleu: { price: 17.77 } },
    dayRule: { type: "constant", dayType: "bleu" }
});
