defineTarif({
    name: "Octopus - Base",
    offer_type: "Marché",
    lastUpdate: "2025-08-01",
    isCommunity: true,
    subscription_url: "https://www.octopusenergy.fr/offre-electricite-tarifs",
    price_url: "https://a.storyblok.com/f/151412/x/cea34c87af/grille-tarifaire-eco_conso_fixe_6_aout25.pdf",
    subscriptions: {
        3: 11.73,
        6: 15.47,
        9: 19.39,
        12: 23.32,
        15: 27.06,
        18: 30.76,
        24: 38.79,
        30: 46.44,
        36: 55.05
    },
    dayTypes: { bleu: { price: 18.56 } },
    dayRule: { type: "constant", dayType: "bleu" }
});
