// Tests hermétiques de import/lib/spot-data.mjs : groupage par jour local
// Europe/Paris, normalisation DST à 24/96 valeurs, sérialisation stable.
import { test } from 'node:test';
import assert from 'node:assert';
import {
    parisDayAndLabel, groupByLocalDay, normalizeDay, buildDays,
    serializeYearFile, splitByYear,
} from '../lib/spot-data.mjs';

// Journée locale Paris à pas constant : startUtc = début du jour en UTC.
function daySeconds(startUtc, count, stepSeconds = 3600) {
    return Array.from({ length: count }, (_, i) => startUtc / 1000 + i * stepSeconds);
}

const JAN_15 = Date.UTC(2024, 0, 14, 23); // 2024-01-15 00:00 Paris (UTC+1)
const MAR_31 = Date.UTC(2024, 2, 30, 23); // 2024-03-31 : passage à l'heure d'été (23 h)
const OCT_27 = Date.UTC(2024, 9, 26, 22); // 2024-10-27 : passage à l'heure d'hiver (25 h)

test('parisDayAndLabel : conversion UTC -> jour et créneau locaux', () => {
    assert.deepStrictEqual(parisDayAndLabel(JAN_15 / 1000), { date: '2024/01/15', label: '00:00' });
    // Été : UTC+2 (2024-07-15 00:00 Paris = 2024-07-14 22:00 UTC)
    assert.deepStrictEqual(parisDayAndLabel(Date.UTC(2024, 6, 14, 22) / 1000), { date: '2024/07/15', label: '00:00' });
    assert.deepStrictEqual(parisDayAndLabel(JAN_15 / 1000 + 23 * 3600), { date: '2024/01/15', label: '23:00' });
});

test('groupByLocalDay : groupe et trie par jour local, écarte les prix null', () => {
    const seconds = daySeconds(JAN_15, 24);
    const prices = Array.from({ length: 24 }, (_, i) => i);
    prices[5] = null;
    const byDay = groupByLocalDay(seconds, prices);

    assert.deepStrictEqual([...byDay.keys()], ['2024/01/15']);
    assert.strictEqual(byDay.get('2024/01/15').length, 23); // le null est écarté
    assert.strictEqual(byDay.get('2024/01/15')[0].label, '00:00');
});

test('normalizeDay : jour horaire normal -> 24 valeurs arrondies', () => {
    const entries = daySeconds(JAN_15, 24).map((seconds, i) => ({
        seconds, label: parisDayAndLabel(seconds).label, price: i + 0.123,
    }));
    const values = normalizeDay(entries);
    assert.strictEqual(values.length, 24);
    assert.strictEqual(values[0], 0.12); // arrondi à 2 décimales
    assert.strictEqual(values[23], 23.12);
});

test('normalizeDay : passage à l\'heure d\'été (23 h) -> heure 02 comblée', () => {
    // 23 heures consécutives : 00, 01 (UTC+1) puis 03..23 (UTC+2).
    const entries = daySeconds(MAR_31, 23).map((seconds, i) => ({
        seconds, label: parisDayAndLabel(seconds).label, price: i * 10,
    }));
    assert.strictEqual(entries[2].label, '03:00', 'l\'heure 02 locale n\'existe pas ce jour-là');
    const values = normalizeDay(entries);
    assert.strictEqual(values.length, 24);
    assert.strictEqual(values[1], 10);  // 01:00
    assert.strictEqual(values[2], 10);  // 02:00 comblé depuis 01:00
    assert.strictEqual(values[3], 20);  // 03:00 = 3e entrée réelle
    assert.strictEqual(values[23], 220);
});

test('normalizeDay : passage à l\'heure d\'hiver (25 h) -> les deux 02:00 moyennés', () => {
    const entries = daySeconds(OCT_27, 25).map((seconds, i) => ({
        seconds, label: parisDayAndLabel(seconds).label, price: i * 10,
    }));
    assert.strictEqual(entries[2].label, '02:00');
    assert.strictEqual(entries[3].label, '02:00', 'l\'heure 02 locale existe deux fois');
    const values = normalizeDay(entries);
    assert.strictEqual(values.length, 24);
    assert.strictEqual(values[2], 25); // moyenne de 20 et 30
    assert.strictEqual(values[3], 40); // 03:00
    assert.strictEqual(values[23], 240);
});

test('normalizeDay : quart-horaire normal (96) et jour d\'heure d\'été (92)', () => {
    const normal = daySeconds(JAN_15, 96, 900).map(seconds => ({
        seconds, label: parisDayAndLabel(seconds).label, price: 50,
    }));
    assert.strictEqual(normalizeDay(normal).length, 96);

    const dst = daySeconds(MAR_31, 92, 900).map(seconds => ({
        seconds, label: parisDayAndLabel(seconds).label, price: 50,
    }));
    const values = normalizeDay(dst);
    assert.strictEqual(values.length, 96);
    assert.strictEqual(values[8], 50); // 02:00 comblé
});

test('normalizeDay : trou ou doublon hors heure 02 -> jour rejeté', () => {
    const entries = daySeconds(JAN_15, 24).map((seconds, i) => ({
        seconds, label: parisDayAndLabel(seconds).label, price: i,
    }));
    assert.strictEqual(normalizeDay(entries.filter(e => e.label !== '05:00')), null, 'trou à 05:00');
    assert.strictEqual(normalizeDay([...entries, entries[10]]), null, 'doublon à 10:00');
    assert.strictEqual(normalizeDay(entries.slice(0, 12)), null, 'jour incomplet');
    assert.strictEqual(normalizeDay([]), null);
});

test('buildDays : jours valides retenus, incomplets listés dans skipped', () => {
    const day1 = daySeconds(JAN_15, 24);
    const day2 = daySeconds(JAN_15 + 24 * 3600 * 1000, 6); // lendemain incomplet
    const seconds = [...day1, ...day2];
    const prices = seconds.map(() => 42);
    const { days, skipped } = buildDays(seconds, prices);

    assert.deepStrictEqual(Object.keys(days), ['2024/01/15']);
    assert.deepStrictEqual(skipped, ['2024/01/16']);
});

test('serializeYearFile : sortie stable, dates triées, attribution CC BY 4.0', () => {
    const days = {
        '2024/01/16': Array(24).fill(2),
        '2024/01/15': [1.5, -0.07, ...Array(22).fill(80)],
    };
    const content = serializeYearFile('epex-fr', '2024', days);

    assert.match(content, /CC BY 4\.0/);
    assert.match(content, /SMARD\.de/);
    assert.match(content, /defineSpotPrices\("epex-fr", \{/);
    assert.ok(content.indexOf('2024/01/15') < content.indexOf('2024/01/16'), 'dates triées');
    assert.match(content, /"2024\/01\/15": \[1\.5,-0\.07,80/, 'nombres compacts');
    // Idempotence : même contenu à la re-sérialisation.
    assert.strictEqual(serializeYearFile('epex-fr', '2024', days), content);
});

test('splitByYear : répartition par année', () => {
    const byYear = splitByYear({
        '2023/12/31': [1], '2024/01/01': [2], '2024/06/15': [3],
    });
    assert.deepStrictEqual([...byYear.keys()].sort(), ['2023', '2024']);
    assert.deepStrictEqual(Object.keys(byYear.get('2024')).sort(), ['2024/01/01', '2024/06/15']);
});
