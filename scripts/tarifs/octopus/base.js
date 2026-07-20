defineTarif({
    name: "Octopus - Base",
    offer_type: "Marché",
    lastUpdate: "2026-03-19",
    isCommunity: true,
    subscription_url: "https://www.octopusenergy.fr/offre-electricite-tarifs",
    price_url: "https://a.storyblok.com/f/151412/x/a5a79d71c2/grille-tarifaire-eco_conso_fixe_2_b_mars26.pdf",
    subscriptions: {
        3: 12.03,
        6: 15.65,
        9: 19.56,
        12: 23.32,
        15: 26.84,
        18: 30.49,
        24: 38.24,
        30: 45.37,
        36: 53.06
    },
    dayTypes: { bleu: { price: 18.95 } },
    // 3 et 6 kVA ont un prix du kWh plus élevé (la grille majore les puissances 1 à 6)
    priceOverrides: { 3: { bleu: { price: 19.09 } }, 6: { bleu: { price: 19.09 } } },
    dayRule: { type: "constant", dayType: "bleu" }
});
