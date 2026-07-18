// Les jours de pointe viennent du calendrier partagé
// scripts/tarifs-lib/calendars/ejp-edf.js (chargé avant ce fichier).
// Contrairement à Tempo, EJP n'a pas de report « avant 6h = veille ».
defineTarif({
    name: "EDF - EJP",
    offer_type: "TRV",
    lastUpdate: "2026-02-01",
    isCommunity: false,
    subscription_url: "",
    price_url: "https://particulier.edf.fr/content/dam/2-Actifs/Documents/Offres/Grille_prix_EJP.pdf",
    subscriptions: { 9: 19.20, 12: 22.71, 15: 26.27, 18: 29.74, 36: 51.31 },
    dayTypes: {
        bleu: { HP: 17.81, HC: 17.81 },
        rouge: { HP: 34.40, HC: 17.81 }
    },
    dayRule: { type: "calendar", default: "bleu", calendar: "ejp-edf" },
    hcRanges: [{ from: "01:00", to: "07:00" }]
});
