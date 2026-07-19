defineTarif({
    name: "Mint Energie - Online & Green HC",
    offer_type: "Marché",
    lastUpdate: "2025-08-01",
    isCommunity: true,
    subscription_url: "https://www.mint-energie.com/Pages/Informations/tarifs_elec.aspx",
    price_url: "https://doc.mint-energie.com/MintEnergie/MINT_ENERGIE_Fiche_Tarifs_21912_ONLINE_GREEN.pdf",
    subscriptions: {
        6: 16.01,
        9: 20.21,
        12: 24.28,
        15: 28.15,
        18: 32.13,
        24: 40.53,
        30: 48.34,
        36: 56.20
    },
    dayTypes: { bleu: { HP: 18.91, HC: 14.95 } },
    dayRule: { type: "constant", dayType: "bleu" },
    hcRanges: [{ from: "22:00", to: "24:00" }, { from: "00:00", to: "06:00" }]
});
