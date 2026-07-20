// Tests hermétiques de import/lib/zenflex-data.mjs : parsing de la réponse de
// l'API OPM, mapping statut -> type via la config ZENFLEX (les fonctions
// génériques viennent de tempo-data.mjs), dates à requêter.
import { test } from 'node:test';
import assert from 'node:assert';
import { ZENFLEX, parseOpmResponse, requestDates, nextDay } from '../lib/zenflex-data.mjs';
import { daysByType, mergeDaysByType, serializeCalendarFile } from '../lib/tempo-data.mjs';

test('parseOpmResponse : une réponse couvre la date demandée et son lendemain', () => {
    assert.deepStrictEqual(
        parseOpmResponse({ couleurJourJ: 'ZENF_PM', couleurJourJ1: 'RAS' }, '2026-01-29'),
        [
            { date: '2026-01-29', statut: 'ZENF_PM' },
            { date: '2026-01-30', statut: 'RAS' },
        ]);
    // Le lendemain franchit mois et année.
    assert.deepStrictEqual(
        parseOpmResponse({ couleurJourJ: 'RAS', couleurJourJ1: 'NON_DETERMINE' }, '2025-12-31'),
        [
            { date: '2025-12-31', statut: 'RAS' },
            { date: '2026-01-01', statut: 'NON_DETERMINE' },
        ]);
});

test('parseOpmResponse : réponse invalide -> throw', () => {
    assert.throws(() => parseOpmResponse(null, '2026-01-29'), /réponse OPM invalide/);
    assert.throws(() => parseOpmResponse({}, '2026-01-29'), /réponse OPM invalide/);
    assert.throws(() => parseOpmResponse({ couleurJourJ: 'RAS' }, '2026-01-29'), /réponse OPM invalide/);
});

test('daysByType : config ZENFLEX, statuts ignorés, statut inconnu -> throw', () => {
    const entries = [
        { date: '2026-01-29', statut: 'ZENF_PM' },
        { date: '2026-01-30', statut: 'RAS' },
        { date: '2023-12-07', statut: 'ZENF_BONIF' }, // bonifié : non modélisé par le tarif
        { date: '2025-09-11', statut: 'ZENF_BONUS' }, // bonus d'été : non modélisé non plus
        { date: '2026-07-21', statut: 'NON_DETERMINE' },
        { date: '2026-01-26', statut: 'ZENF_PM' },
    ];
    assert.deepStrictEqual(daysByType(entries, ZENFLEX), {
        sobriete: ['2026/01/26', '2026/01/29'],
    });
    assert.throws(
        () => daysByType([{ date: '2026-01-05', statut: 'ZENF_VIOLET' }], ZENFLEX),
        /statut inconnu "ZENF_VIOLET"/);
});

test('requestDates : une date sur deux, la couverture peut déborder d\'un jour', () => {
    assert.deepStrictEqual(requestDates('2026-01-01', '2026-01-04'),
        ['2026-01-01', '2026-01-03']); // couvre 01 -> 04
    assert.deepStrictEqual(requestDates('2026-01-01', '2026-01-05'),
        ['2026-01-01', '2026-01-03', '2026-01-05']); // couvre 01 -> 06
    assert.deepStrictEqual(requestDates('2026-01-01', '2026-01-01'), ['2026-01-01']);
    assert.deepStrictEqual(requestDates('2026-01-02', '2026-01-01'), []);
    // Le pas de deux franchit les fins de mois.
    assert.deepStrictEqual(requestDates('2026-02-27', '2026-03-02'),
        ['2026-02-27', '2026-03-01']);
});

test('nextDay : fins de mois et d\'année', () => {
    assert.strictEqual(nextDay('2026-01-31'), '2026-02-01');
    assert.strictEqual(nextDay('2026-12-31'), '2027-01-01');
    assert.strictEqual(nextDay('2024-02-28'), '2024-02-29'); // bissextile
});

test('fusion --full : la fenêtre API est remplacée, l\'historique antérieur préservé', () => {
    const existing = { sobriete: ['2021/01/05', '2024/01/08', '2024/01/09'] };
    const fetched = { sobriete: ['2024/01/09', '2026/01/29'] }; // 2024/01/08 absent du re-fetch
    const merged = mergeDaysByType(existing, fetched, ['2023/09/01', '2026/07/21']);
    assert.deepStrictEqual(merged, {
        sobriete: ['2021/01/05', '2024/01/09', '2026/01/29'],
    });
});

test('serializeCalendarFile : config ZENFLEX, un seul type, format exact', () => {
    const content = serializeCalendarFile(ZENFLEX, {
        sobriete: ['2026/01/29', '2026/01/26', '2026/01/29'],
    });
    assert.match(content, /^\/\/ Calendrier des jours de sobriété/);
    assert.match(content, /import\/zenflex-update\.mjs/);
    assert.match(content, /defineCalendar\("zenflex-sobriete", \{/);
    assert.match(content, /sobriete: \{\n        numberOfDays: 20,\n        monthBegin: 10,\n        monthEnd: 4,/);
    // Tri + dédup, indentation exacte des dates (12 espaces).
    assert.match(content, /\n            "2026\/01\/26",\n            "2026\/01\/29",\n/);
    assert.strictEqual(content.match(/"2026\/01\/29"/g).length, 1, 'dédupliqué');
    assert.ok(content.endsWith('});\n'));
});
