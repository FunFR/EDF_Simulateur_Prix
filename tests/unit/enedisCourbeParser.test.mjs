import { test } from 'node:test';
import assert from 'node:assert';
import { enedisCourbeParser } from '../../scripts/parsers/enedisCourbeParser.js';
import { selectParser } from '../../scripts/parsers/index.js';

const HEADER = [
    'Courbe de charge Linky (pas 30 min) - PRM 00000000000000',
    'Horodate fin de pas;Puissance moyenne (W)'
];

test('selectParser route conso-courbe-30min vers enedisCourbeParser', () => {
    assert.strictEqual(
        selectParser('conso-courbe-30min_00000000000000_20240201-20260130.csv'),
        enedisCourbeParser
    );
    // et ne perturbe pas le routage existant
    assert.notStrictEqual(
        selectParser('Enedis_Conso_Heure_20240201-20260130_00000.csv'),
        enedisCourbeParser
    );
});

test('fixture inline : en-têtes ignorés, 00:00 -> 24:00 jour précédent, dédoublonnage, ordre récent -> ancien', () => {
    const csv = [
        ...HEADER,
        '2026-07-13T23:00:00;420',
        '2026-07-13T23:30:00;380',
        '2026-07-13T23:30:00;9999',   // doublon : gardé (dernier du fichier, premier après reverse)
        '2026-07-14T00:00:00;350',    // minuit : rattaché au 13 sous 24:00
        '2026-07-14T00:30:00;300'
    ].join('\n');

    const data = enedisCourbeParser.loadData(enedisCourbeParser.parseCSV(csv));

    assert.strictEqual(data.length, 2);
    assert.strictEqual(data[0].date, '2026/07/14');
    assert.strictEqual(data[1].date, '2026/07/13');
    assert.deepStrictEqual(data[0].hours, [['00:30:00', '300']]);
    assert.deepStrictEqual(data[1].hours, [
        ['24:00:00', '350'],
        ['23:30:00', '9999'],
        ['23:00:00', '420']
    ]);
});

test('tolérance CRLF et lignes vides', () => {
    const csv = HEADER.join('\r\n') + '\r\n'
        + '2026-07-13T23:00:00;420\r\n'
        + '2026-07-13T23:30:00;380\r\n'
        + '\r\n';
    const data = enedisCourbeParser.loadData(enedisCourbeParser.parseCSV(csv));

    assert.strictEqual(data.length, 1);
    assert.strictEqual(data[0].date, '2026/07/13');
    // relevés stockés du plus récent au plus ancien (reverse du CSV chronologique)
    assert.deepStrictEqual(data[0].hours.map(h => h[1]), ['380', '420']);
});

test('journée complète : 48 relevés, minuit inclus sous 24:00', () => {
    const lines = [...HEADER];
    // Fins de pas du 2026-07-13T00:30 au 2026-07-14T00:00 : une journée complète.
    for (let i = 1; i <= 48; i++) {
        const totalMin = i * 30;
        const day = totalMin >= 24 * 60 ? '14' : '13';
        const h = String(Math.floor(totalMin / 60) % 24).padStart(2, '0');
        const m = String(totalMin % 60).padStart(2, '0');
        lines.push(`2026-07-${day}T${h}:${m}:00;${100 + i}`);
    }
    const data = enedisCourbeParser.loadData(enedisCourbeParser.parseCSV(lines.join('\n')));

    assert.strictEqual(data.length, 1);
    assert.strictEqual(data[0].date, '2026/07/13');
    assert.strictEqual(data[0].hours.length, 48);
    assert.ok(data[0].hours.some(h => h[0] === '24:00:00'));
    assert.ok(!data[0].hours.some(h => h[0] === '00:00:00'));
});
