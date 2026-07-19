defineTarif({
    name: "Octopus - Heures Creuses",
    offer_type: "Marché",
    lastUpdate: "2025-08-01",
    isCommunity: true,
    subscription_url: "https://www.octopusenergy.fr/offre-electricite-tarifs",
    price_url: "https://a.storyblok.com/f/151412/x/cea34c87af/grille-tarifaire-eco_conso_fixe_6_aout25.pdf",
    subscriptions: {
        6: 15.74,
        9: 20.21,
        12: 24.28,
        15: 28.15,
        18: 32.13,
        24: 40.53,
        30: 48.34,
        36: 54.61
    },
    dayTypes: { bleu: { HP: 19.77, HC: 15.59 } },
    dayRule: { type: "constant", dayType: "bleu" },
    hcRanges: "custom"
});
