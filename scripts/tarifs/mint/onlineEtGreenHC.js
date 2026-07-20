defineTarif({
    name: "Mint Energie - Online & Green HC",
    offer_type: "Marché",
    lastUpdate: "2026-02-01",
    isCommunity: true,
    subscription_url: "https://www.mint-energie.com/Pages/Informations/tarifs_elec.aspx",
    price_url: "https://doc.mint-energie.com/MintEnergie/MINT_ENERGIE_Fiche_Tarifs_21912_ONLINE_GREEN.pdf",
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
    dayTypes: { bleu: { HP: 18.78, HC: 14.46 } },
    dayRule: { type: "constant", dayType: "bleu" },
    hcRanges: [{ from: "22:00", to: "24:00" }, { from: "00:00", to: "06:00" }]
});
