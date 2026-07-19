import { test } from 'node:test';
import assert from 'node:assert';
import { computeMonths, sumPeriod } from '../../scripts/core/calculator.js';
import { makeFullDay, makePartialDay, makeGrille } from '../helpers/makeDay.mjs';

const HC_TEMPO = [
    { start: { hour: 22, minute: 0 }, end: { hour: 24, minute: 0 } },
    { start: { hour: 0, minute: 0 }, end: { hour: 6, minute: 0 } }
];

// Vue résolue étroite attendue par computeMonths, telle que construite
// par simulation.js à partir d'une grille.
function viewOf(grille, kva = 6) {
    return {
        plan: grille.prices.find(p => p.puissance === kva),
        getDayType: grille.getDayType.bind(grille),
        hcRangesFor: dayType => grille.hcByDayType?.[dayType] ?? grille.hc
    };
}

function typeAt(monthsData, timeLabel) {
    const hour = monthsData[0].days[0].hours.find(h =>
        `${String(h.time.hour).padStart(2, '0')}:${String(h.time.minute).padStart(2, '0')}` === timeLabel);
    assert.ok(hour, `relevé ${timeLabel} introuvable`);
    return hour.type;
}

test('frontières isHC : début strict, fin incluse, minuit = 24h, demi-heures', () => {
    const grille = makeGrille({ hc: HC_TEMPO });
    const months = computeMonths(viewOf(grille), [makeFullDay('2024/03/05')]);

    assert.strictEqual(typeAt(months, '22:00'), 'bleu HP'); // time > begin est strict
    assert.strictEqual(typeAt(months, '22:30'), 'bleu HC');
    assert.strictEqual(typeAt(months, '24:00'), 'bleu HC'); // minuit compté comme 24h -> fin de plage incluse
    assert.strictEqual(typeAt(months, '00:30'), 'bleu HC');
    assert.strictEqual(typeAt(months, '06:00'), 'bleu HC'); // fin de plage incluse
    assert.strictEqual(typeAt(months, '06:30'), 'bleu HP');
    assert.strictEqual(typeAt(months, '12:00'), 'bleu HP');
});

test('formule de prix : W / step -> kWh, centimes -> euros, abonnement réparti par jour', () => {
    // 48 relevés de 1000 W à pas 30 min -> 24 kWh sur la journée
    const grille = makeGrille({ hc: [{ start: { hour: 0, minute: 0 }, end: { hour: 24, minute: 0 } }] });
    const months = computeMonths(viewOf(grille), [makeFullDay('2024/03/05', 1000)]);
    const day = months[0].days[0];

    assert.strictEqual(day.conso, 24000); // en Wh
    // 24 kWh à 10 c€/kWh = 2,40 € + abonnement 30 €/31 jours
    assert.ok(Math.abs(day.price - (2.4 + 30 / 31)) < 1e-9);
});

test('jour incomplet (moins de 24 relevés) : conso et prix NaN', () => {
    const grille = makeGrille();
    const months = computeMonths(viewOf(grille), [makePartialDay('2024/03/05', 10)]);
    const day = months[0].days[0];

    assert.ok(Number.isNaN(day.conso));
    assert.ok(Number.isNaN(day.price));
    assert.strictEqual(day.consoHC, 0); // les agrégats HC/HP restent à zéro
});

test('mois incomplet : hasErrors et abonnement facturé sur les jours manquants', () => {
    const grille = makeGrille();
    const months = computeMonths(viewOf(grille), [makeFullDay('2024/03/05', 1000)]);
    const month = months[0];

    assert.strictEqual(month.hasErrors, true);
    assert.strictEqual(month.numberOfDaysInMonth, 31);
    // prix du mois = prix du seul jour présent + 30 jours d'abonnement manquants
    const expected = month.days[0].price + 30 * month.aboPriceByDay;
    assert.ok(Math.abs(month.price - expected) < 1e-9);
});

test('puissance absente de la grille : aucun mois calculé', () => {
    const grille = makeGrille();
    const months = computeMonths(viewOf(grille, 42), [makeFullDay('2024/03/05')]);
    assert.deepStrictEqual(months, []);
});

test('hcByDayType prioritaire sur hc', () => {
    // hc dit "tout HC" mais hcByDayType.bleu dit "rien en HC" : hcByDayType gagne
    const grille = makeGrille({
        hc: [{ start: { hour: 0, minute: 0 }, end: { hour: 24, minute: 0 } }],
        hcByDayType: { bleu: [] }
    });
    const months = computeMonths(viewOf(grille), [makeFullDay('2024/03/05')]);
    const day = months[0].days[0];

    assert.strictEqual(day.consoHC, 0);
    assert.ok(day.consoHP > 0);
});

test('hcByDayType sans entrée pour le dayType : retombe sur hc', () => {
    const grille = makeGrille({
        hc: [{ start: { hour: 0, minute: 0 }, end: { hour: 24, minute: 0 } }],
        hcByDayType: { autre: [] }
    });
    const months = computeMonths(viewOf(grille), [makeFullDay('2024/03/05')]);
    assert.strictEqual(months[0].days[0].consoHP, 0);
});

test('sumPeriod : filtre par mois et exclut les NaN', () => {
    const monthsData = [
        { firstDayDate: new Date(2024, 0, 1), conso: 100, price: 10 },
        { firstDayDate: new Date(2024, 1, 1), conso: NaN, price: NaN },
        { firstDayDate: new Date(2024, 2, 1), conso: 200, price: 20 },
        { firstDayDate: new Date(2024, 3, 1), conso: 400, price: 40 } // hors période
    ];
    const period = sumPeriod(monthsData, new Date(2024, 0, 1), new Date(2024, 2, 1));

    assert.strictEqual(period.conso, 300);
    assert.strictEqual(period.price, 30);
    assert.strictEqual(period.months.length, 3);
});
