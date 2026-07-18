// Les jours rouges et blancs viennent du calendrier partagé
// scripts/tarifs-lib/calendars/tempo-edf.js (chargé avant ce fichier).
defineTarif({
    name: "EDF - Tempo",
    offer_type: "TRV",
    lastUpdate: "2026-02-01",
    isCommunity: false,
    subscription_url: "https://particulier.edf.fr/fr/accueil/gestion-contrat/options/tempo/details.html",
    price_url: "https://particulier.edf.fr/content/dam/2-Actifs/Documents/Offres/Grille_prix_Tarif_Bleu.pdf",
    subscriptions: { 6: 15.59, 9: 19.38, 12: 23.07, 15: 26.47, 18: 30.04, 30: 44.73, 36: 52.42 },
    dayTypes: {
        bleu: { HP: 16.12, HC: 13.25 },
        blanc: { HP: 18.71, HC: 14.99 },
        rouge: { HP: 70.60, HC: 15.75 }
    },
    dayRule: {
        type: "calendar",
        default: "bleu",
        calendar: "tempo-edf",
        previousDayBefore: 6   // avant 6h, la couleur est celle de la veille
    },
    hcRanges: [
        { from: "22:00", to: "24:00" },
        { from: "00:00", to: "06:00" }
    ]
});
