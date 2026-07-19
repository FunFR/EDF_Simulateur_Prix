defineTarif({
    name: "EDF - Zen Week-End",
    offer_type: "Marché",
    lastUpdate: "2026-02-01",
    isCommunity: false,
    subscription_url: "https://particulier.edf.fr/fr/accueil/electricite-gaz/offres-electricite/offres-marche/electricite-weekend/zen-week-end.html",
    price_url: "https://particulier.edf.fr/content/dam/2-Actifs/Documents/Offres/grille-prix-zen-week-end.pdf",
    subscriptions: { 3: 11.25, 6: 14.78, 9: 18.49, 12: 22.21, 15: 25.74, 18: 29.23, 24: 36.84, 30: 44.07, 36: 51.50 },
    dayTypes: {
        bleu: { price: 20.38 },
        weekend: { price: 15.38 }
    },
    dayRule: { type: "weekly", default: "bleu", days: { weekend: [0, 6] } }
});

defineTarif({
    name: "EDF - Zen Week-End HC",
    offer_type: "Marché",
    lastUpdate: "2026-02-01",
    isCommunity: false,
    subscription_url: "https://particulier.edf.fr/fr/accueil/electricite-gaz/offres-electricite/offres-marche/electricite-weekend/zen-week-end.html",
    price_url: "https://particulier.edf.fr/content/dam/2-Actifs/Documents/Offres/grille-prix-zen-week-end.pdf",
    subscriptions: { 6: 15.05, 9: 18.91, 12: 22.65, 15: 26.17, 18: 29.81, 24: 37.52, 30: 44.65, 36: 51.82 },
    dayTypes: {
        bleu: { HP: 21.53, HC: 16.18 },
        weekend: { HP: 16.18, HC: 16.18 }   // tout le week-end au prix HC
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
    lastUpdate: "2026-02-01",
    isCommunity: false,
    subscription_url: "https://particulier.edf.fr/fr/accueil/electricite-gaz/offres-electricite/offres-marche/electricite-weekend/zen-flex.html",
    price_url: "https://particulier.edf.fr/content/dam/2-Actifs/Documents/Offres/grille-prix-zen-week-end.pdf",
    subscriptions: { 6: 15.05, 9: 18.91, 12: 22.65, 15: 26.17, 18: 29.81, 24: 37.52, 30: 44.65, 36: 51.82 },
    dayTypes: {
        bleu: { HP: 20.91, HC: 15.19 },
        sobriete: { HP: 72.53, HC: 20.91 }
    },
    dayRule: { type: "calendar", default: "bleu", calendar: "zenflex-sobriete" },
    hcRanges: [
        { from: "00:00", to: "08:00" },
        { from: "13:00", to: "18:00" },
        { from: "20:00", to: "24:00" }
    ]
});
