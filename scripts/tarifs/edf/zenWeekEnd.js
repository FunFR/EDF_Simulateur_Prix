defineTarif({
    name: "EDF - Zen Week-End",
    offer_type: "Marché",
    lastUpdate: "2026-03-16",
    isCommunity: false,
    subscription_url: "https://particulier.edf.fr/fr/accueil/electricite-gaz/offres-electricite/offres-marche/electricite-weekend/zen-week-end.html",
    price_url: "https://particulier.edf.fr/content/dam/2-Actifs/Documents/Offres/grille-prix-zen-week-end.pdf",
    subscriptions: { 3: 12.03, 6: 15.65, 9: 19.56, 12: 23.32, 15: 26.84, 18: 30.49, 24: 38.24, 30: 45.37, 36: 52.54 },
    dayTypes: {
        bleu: { price: 21.8 },
        weekend: { price: 16.37 }
    },
    dayRule: { type: "weekly", default: "bleu", days: { weekend: [0, 6] } }
});

defineTarif({
    name: "EDF - Zen Week-End HC",
    offer_type: "Marché",
    lastUpdate: "2026-03-16",
    isCommunity: false,
    subscription_url: "https://particulier.edf.fr/fr/accueil/electricite-gaz/offres-electricite/offres-marche/electricite-weekend/zen-week-end.html",
    price_url: "https://particulier.edf.fr/content/dam/2-Actifs/Documents/Offres/grille-prix-zen-week-end.pdf",
    subscriptions: { 6: 15.65, 9: 19.56, 12: 23.32, 15: 26.84, 18: 30.49, 24: 38.24, 30: 45.37, 36: 52.54 },
    dayTypes: {
        bleu: { HP: 22.63, HC: 16.95 },
        weekend: { HP: 16.95, HC: 16.95 }   // tout le week-end au prix HC
    },
    dayRule: { type: "weekly", default: "bleu", days: { weekend: [0, 6] } },
    hcRanges: "custom"
});

// Les jours de sobriété viennent du calendrier partagé
// scripts/tarifs-lib/calendars/zenflex-sobriete.js (chargé avant ce fichier).
// Pas de report « avant 6h = veille » sur cette offre.
defineTarif({
    name: "EDF - Zen Week-End Option Flex",
    offer_type: "Marché",
    lastUpdate: "2026-03-16",
    isCommunity: false,
    subscription_url: "https://particulier.edf.fr/fr/accueil/electricite-gaz/offres-electricite/offres-marche/electricite-weekend/zen-flex.html",
    price_url: "https://particulier.edf.fr/content/dam/2-Actifs/Documents/Offres/grille-prix-zen-week-end.pdf",
    subscriptions: { 6: 15.65, 9: 19.56, 12: 23.32, 15: 26.84, 18: 30.49, 24: 38.24, 30: 45.37, 36: 52.54 },
    dayTypes: {
        bleu: { HP: 20.65, HC: 15.85 },
        sobriete: { HP: 71.48, HC: 20.65 }
    },
    dayRule: { type: "calendar", default: "bleu", calendar: "zenflex-sobriete" },
    hcRanges: [
        { from: "00:00", to: "08:00" },
        { from: "13:00", to: "18:00" },
        { from: "20:00", to: "24:00" }
    ]
});
