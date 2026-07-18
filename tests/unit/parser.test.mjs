import { test } from 'node:test';
import assert from 'node:assert';
import { edfParser } from '../../scripts/parsers/edfParser.js';
import { loadSampleData } from '../helpers/csv.mjs';

test('fixture inline : inversion de date, 00:00 -> 24:00, filtre minutes, dédoublonnage', () => {
    const csv = [
        '',
        'Récapitulatif de mes puissances atteintes en W',
        'Date et heure de relève par le distributeur;Puissance atteinte (W);Nature de la donnée',
        '30/01/2026;;',
        '00:00:00;3916;Réelle',
        '23:30:00;4522;Réelle',
        '23:30:00;9999;Réelle',   // doublon : ignoré
        '23:15:00;1234;Réelle',   // minutes != 00/30 : ignoré
        '23:00:00;7446;Réelle',
        '29/01/2026;;',
        '00:00:00;2000;Réelle'
    ].join('\n');

    const data = edfParser.loadData(edfParser.parseCSV(csv));

    assert.strictEqual(data.length, 2);
    assert.strictEqual(data[0].date, '2026/01/30');
    assert.strictEqual(data[1].date, '2026/01/29');
    assert.deepStrictEqual(data[0].hours, [
        ['24:00:00', '3916'],
        ['23:30:00', '4522'],
        ['23:00:00', '7446']
    ]);
});

test('tolérance CRLF : le \\r résiduel ne perturbe ni les dates ni les relevés', () => {
    const csv = '30/01/2026;;\r\n00:00:00;3916;Réelle\r\n23:30:00;4522;Réelle\r\n';
    const data = edfParser.loadData(edfParser.parseCSV(csv));

    assert.strictEqual(data.length, 1);
    assert.strictEqual(data[0].date, '2026/01/30');
    assert.deepStrictEqual(data[0].hours.map(h => h[1]), ['3916', '4522']);
});

test('CSV réel : 727 jours, du 2026/01/30 au 2024/02/01, 48 relevés par jour complet', () => {
    const data = loadSampleData();

    assert.strictEqual(data.length, 727);
    assert.strictEqual(data[0].date, '2026/01/30');
    assert.strictEqual(data[data.length - 1].date, '2024/02/01');

    // minuit rattaché à la journée précédente sous le libellé 24:00
    assert.ok(data[0].hours.some(h => h[0] === '24:00:00'));
    assert.ok(!data[0].hours.some(h => h[0] === '00:00:00'));

    // toutes les valeurs sont des entiers en W
    for (const day of data) {
        for (const [, value] of day.hours) {
            assert.match(value, /^\d+$/, `valeur non entière le ${day.date}`);
        }
    }
});
