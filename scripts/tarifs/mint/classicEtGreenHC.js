defineTarif({
    name: "Mint Energie - Classic & Green HC",
    offer_type: "Marché",
    lastUpdate: "2026-02-01",
    isCommunity: true,
    subscription_url: "https://www.mint-energie.com/Pages/Informations/tarifs_elec.aspx",
    price_url: "https://doc.mint-energie.com/MintEnergie/MINT_ENERGIE_Fiche_Tarifs_23012_CLASSIC_GREEN.pdf",
    subscriptions: {
        6: 15.47,
        9: 16.62,
        12: 21.36,
        15: 24.91,
        18: 28.45,
        24: 36.75,
        30: 44.44,
        36: 51.53
    },
    dayTypes: { bleu: { HP: 20.91, HC: 16.46 } },
    dayRule: { type: "constant", dayType: "bleu" },
    hcRanges: [{ from: "22:00", to: "24:00" }, { from: "00:00", to: "06:00" }]
});
