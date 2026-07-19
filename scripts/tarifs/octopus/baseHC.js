defineTarif({
    name: "Octopus - Heures Creuses",
    offer_type: "Marché",
    lastUpdate: "2026-03-19",
    isCommunity: true,
    subscription_url: "https://www.octopusenergy.fr/offre-electricite-tarifs",
    price_url: "https://a.storyblok.com/f/151412/x/a5a79d71c2/grille-tarifaire-eco_conso_fixe_2_b_mars26.pdf",
    subscriptions: {
        6: 15.65,
        9: 19.83,
        12: 23.68,
        15: 27.30,
        18: 31.03,
        24: 38.97,
        30: 46.27,
        36: 52.54
    },
    dayTypes: { bleu: { HP: 20.31, HC: 15.55 } },
    dayRule: { type: "constant", dayType: "bleu" },
    hcRanges: "custom"
});
