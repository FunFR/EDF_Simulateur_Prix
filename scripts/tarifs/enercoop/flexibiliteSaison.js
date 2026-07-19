defineTarif({
    name: "Enercoop - Offre Flexibilité 2 Saisons",
    offer_type: "Marché",
    lastUpdate: "2026-02-26",
    isCommunity: false,
    subscription_url: "https://www.faq.enercoop.fr/hc/fr",
    price_url: "https://www.faq.enercoop.fr/hc/fr/article_attachments/34072541524114",
    subscriptions: {
        3: 10.02,
        6: 15.86,
        9: 21.22,
        12: 26.81,
        15: 32.30,
        18: 37.87,
        24: 48.74,
        30: 59.82,
        36: 70.89
    },
    dayTypes: {
        hiver: { HP: 31.040, HC: 22.900 },
        hiverWeekend: { HP: 31.040, HC: 22.900 },
        ete: { HP: 19.367, HC: 13.715 },
        eteWeekend: { HP: 19.367, HC: 13.715 }
    },
    dayRule: {
        type: "season",
        seasons: {
            hiver: { months: [11, 12, 1, 2, 3], weekendType: "hiverWeekend" },
            ete: { months: [4, 5, 6, 7, 8, 9, 10], weekendType: "eteWeekend" }
        },
        weekendDays: [0, 6],
        previousDayBefore: 6
    },
    // Le week-end, toute la journée est facturée en heures creuses.
    hcRanges: {
        byDayType: {
            hiver: [{ from: "00:00", to: "07:00" }, { from: "13:00", to: "16:00" }],
            ete: [{ from: "11:00", to: "17:00" }],
            hiverWeekend: [{ from: "00:00", to: "24:00" }],
            eteWeekend: [{ from: "00:00", to: "24:00" }]
        }
    }
});
