defineTarif({
    name: "EDF - Zen Week-End",
    offer_type: "Marché",
    lastUpdate: "2026-08-01",
    isCommunity: false,
    subscription_url: "https://particulier.edf.fr/fr/accueil/electricite-gaz/offres-electricite/offres-marche/electricite-weekend/zen-week-end.html",
    price_url: "https://particulier.edf.fr/content/dam/2-Actifs/Documents/Offres/grille-prix-zen-week-end.pdf",
    subscriptions: { 3: 12.06, 6: 15.69, 9: 19.62, 12: 23.39, 15: 26.93, 18: 30.59, 24: 38.37, 30: 45.52, 36: 52.72 },
    dayTypes: {
        bleu: { price: 21.77 },
        weekend: { price: 16.35 }
    },
    dayRule: { type: "weekly", default: "bleu", days: { weekend: [0, 6] } }
});

defineTarif({
    name: "EDF - Zen Week-End HC",
    offer_type: "Marché",
    lastUpdate: "2026-08-01",
    isCommunity: false,
    subscription_url: "https://particulier.edf.fr/fr/accueil/electricite-gaz/offres-electricite/offres-marche/electricite-weekend/zen-week-end.html",
    price_url: "https://particulier.edf.fr/content/dam/2-Actifs/Documents/Offres/grille-prix-zen-week-end.pdf",
    subscriptions: { 6: 15.69, 9: 19.62, 12: 23.39, 15: 26.93, 18: 30.59, 24: 38.37, 30: 45.52, 36: 52.72 },
    dayTypes: {
        bleu: { HP: 22.6, HC: 16.92 },
        weekend: { HP: 16.92, HC: 16.92 }   // tout le week-end au prix HC
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
    lastUpdate: "2026-08-01",
    isCommunity: false,
    subscription_url: "https://particulier.edf.fr/fr/accueil/electricite-gaz/offres-electricite/offres-marche/electricite-weekend/zen-flex.html",
    price_url: "https://particulier.edf.fr/content/dam/2-Actifs/Documents/Offres/grille-prix-zen-week-end.pdf",
    subscriptions: { 6: 15.69, 9: 19.62, 12: 23.39, 15: 26.93, 18: 30.59, 24: 38.37, 30: 45.52, 36: 52.72 },
    dayTypes: {
        bleu: { HP: 20.62, HC: 15.82 },
        sobriete: { HP: 71.45, HC: 20.62 }
    },
    dayRule: { type: "calendar", default: "bleu", calendar: "zenflex-sobriete" },
    hcRanges: [
        { from: "00:00", to: "08:00" },
        { from: "13:00", to: "18:00" },
        { from: "20:00", to: "24:00" }
    ]
});
