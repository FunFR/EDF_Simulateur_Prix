// Trois déclinaisons de la même offre : seule la fenêtre « happy » change
// (2h consécutives à prix réduit, choisies à la souscription). Les heures
// happy tombent hors des plages HC (0h-6h) : elles sont comptées en HP au
// prix happy, comme dans la grille d'origine.
{
    const happySubscriptions = {
        6: 192.07 / 12,
        9: 242.53 / 12,
        12: 291.41 / 12,
        15: 337.85 / 12,
        18: 385.57 / 12,
        24: 486.36 / 12,
        30: 580.09 / 12,
        36: 674.39 / 12
    };

    for (const [label, fromHour] of [["13h/15h", 13], ["14h/16h", 14], ["15h/17h", 15]]) {
        defineTarif({
            name: `Engie - Happy Heures Vertes - ${label} - 1 an`,
            offer_type: "Marché",
            lastUpdate: "2025-10-27",
            isCommunity: true,
            subscription_url: "https://particuliers.engie.fr/electricite.html",
            price_url: "https://particuliers.engie.fr/content/dam/pdf/fiches-descriptives/fiche-descriptive-elec-happy_heures-vertes-1-an.pdf",
            subscriptions: happySubscriptions,
            dayTypes: {
                bleu: { HP: 24.480, HC: 19.078 },
                happy: { HP: 3.598, HC: 3.598 }
            },
            dayRule: {
                type: "constant",
                dayType: "bleu",
                hourSubTypes: [{ fromHour: fromHour, toHour: fromHour + 2, dayType: "happy" }]
            },
            hcRanges: [{ from: "00:00", to: "06:00" }]
        });
    }
}
