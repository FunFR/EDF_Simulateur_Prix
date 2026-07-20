defineTarif({
    name: "Mint Energie - Online & Green",
    offer_type: "Marché",
    lastUpdate: "2026-02-01",
    isCommunity: true,
    subscription_url: "https://www.mint-energie.com/Pages/Informations/tarifs_elec.aspx",
    price_url: "https://doc.mint-energie.com/MintEnergie/MINT_ENERGIE_Fiche_Tarifs_21912_ONLINE_GREEN.pdf",
    subscriptions: {
        3: 12.03,
        6: 15.65,
        9: 19.56,
        12: 23.32,
        15: 26.85,
        18: 30.49,
        24: 38.24,
        30: 45.37,
        36: 52.54
    },
    dayTypes: { bleu: { price: 17.55 } },
    // 3 et 6 kVA ont un prix du kWh plus élevé
    priceOverrides: { 3: { bleu: { price: 17.67 } }, 6: { bleu: { price: 17.67 } } },
    dayRule: { type: "constant", dayType: "bleu" }
});
