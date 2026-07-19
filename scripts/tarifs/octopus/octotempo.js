// Tarif saisonnier (hiver novembre-mars / été) avec surcharge des jours
// rouges du calendrier Tempo officiel (partagé avec EDF - Tempo via
// tarifs-lib/calendars/tempo-edf.js — la version d'origine lisait les jours
// rouges dans l'objet EDF Tempo du registre).
// Note : la version d'origine (origin/main) écrivait la plage HC du soir
// « 21h -> 0h », une plage morte pour le calculateur (les soirées 21h-minuit
// étaient facturées en heures pleines, 64,69 c en jour rouge). Corrigé ici
// en « 21:00 -> 24:00 », conformément à la grille Octopus (HC 21h-7h).
defineTarif({
    name: "Octopus - OctoTempo",
    offer_type: "Marché",
    lastUpdate: "2026-04-13",
    isCommunity: true,
    subscription_url: "https://octopusenergy.fr/octotempo",
    price_url: "https://a.storyblok.com/f/151412/x/c095a21c44/grille-tarifaire-octotempo.pdf",
    subscriptions: {
        3: 12.03,
        6: 15.65,
        9: 19.56,
        12: 23.32,
        15: 26.84,
        18: 30.49,
        24: 38.24,
        30: 45.37,
        36: 52.54
    },
    dayTypes: {
        rouge: { HP: 64.69, HC: 15.75 },
        hiver: { HP: 18.71, HC: 15.75 },
        ete: { HP: 15.75, HC: 13.25 }
    },
    dayRule: {
        type: "season",
        seasons: {
            hiver: { months: [11, 12, 1, 2, 3] },
            ete: { months: [4, 5, 6, 7, 8, 9, 10] }
        },
        previousDayBefore: 6,
        calendarOverride: { calendar: "tempo-edf", types: ["rouge"] }
    },
    hcRanges: {
        byDayType: {
            rouge: [{ from: "21:00", to: "24:00" }, { from: "00:00", to: "07:00" }],
            hiver: [{ from: "21:00", to: "24:00" }, { from: "00:00", to: "07:00" }],
            ete: [{ from: "21:00", to: "24:00" }, { from: "00:00", to: "07:00" }, { from: "11:00", to: "17:00" }]
        }
    }
});
