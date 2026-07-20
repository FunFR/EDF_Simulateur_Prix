// Fabrique des journées synthétiques au format produit par edfParser.loadData :
// { date: "YYYY/MM/DD", hours: [["HH:MM:00", "<puissance W>"], ...] }
// Comme dans le parser, minuit appartient à la journée précédente et est noté 24:00.

// Journée complète à 48 pas de 30 min. watts : nombre constant ou fonction (index 0..47).
export function makeFullDay(date, watts = 1000) {
    const hours = [];
    for (let i = 0; i < 48; i++) {
        const halfHours = i + 1; // 00:30 ... 24:00
        const hour = Math.floor(halfHours / 2);
        const minute = halfHours % 2 === 0 ? '00' : '30';
        const value = typeof watts === 'function' ? watts(i) : watts;
        hours.push([`${String(hour).padStart(2, '0')}:${minute}:00`, String(value)]);
    }
    return { date, hours };
}

// Journée incomplète (moins de 24 relevés -> step 0 -> jour en erreur).
export function makePartialDay(date, numberOfReadings = 10, watts = 1000) {
    const full = makeFullDay(date, watts);
    return { date, hours: full.hours.slice(0, numberOfReadings) };
}

// Grille tarifaire synthétique minimale respectant le contrat du calculateur.
export function makeGrille(overrides = {}) {
    return {
        name: 'TEST - Grille',
        prices: [{ puissance: 6, abonnement: 30, bleu: { prixKwhHP: 20, prixKwhHC: 10 } }],
        hc: [{ start: { hour: 0, minute: 0 }, end: { hour: 24, minute: 0 } }],
        hasHCCustom: false,
        hasSpecialDaysCustom: false,
        specialDays: [],
        getDayType: function () { return 'bleu'; },
        ...overrides
    };
}
