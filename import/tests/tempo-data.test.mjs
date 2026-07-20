// Tests hermétiques de import/lib/tempo-data.mjs : parsing de la réponse de
// l'API EDF, mapping statut -> type de jour, fusion, diff et sérialisation.
import { test } from 'node:test';
import assert from 'node:assert';
import {
    CALENDARS, parseCalendarResponse, daysByType, mergeDaysByType,
    diffDaysByType, serializeCalendarFile, yearlyChunks,
} from '../lib/tempo-data.mjs';

// Regex de validation des dates de la factory defineCalendar (define-tarif.js).
const DATE_FORMAT = /^\d{4}\/\d{2}\/\d{2}$/;

function apiResponse(option, calendrier, errors = []) {
    return { errors, content: { options: [{ option, calendrier }] } };
}

test('parseCalendarResponse : réponse nominale', () => {
    const json = apiResponse('TEMPO', [
        { dateApplication: '2026-01-05', statut: 'TEMPO_ROUGE' },
        { dateApplication: '2026-01-06', statut: 'TEMPO_BLEU' },
    ]);
    assert.deepStrictEqual(parseCalendarResponse(json, 'TEMPO'), [
        { date: '2026-01-05', statut: 'TEMPO_ROUGE' },
        { date: '2026-01-06', statut: 'TEMPO_BLEU' },
    ]);
});

test('parseCalendarResponse : erreurs API, option absente, date invalide -> throw', () => {
    const withError = apiResponse('TEMPO', [], [
        { code: 'ATM_HTTP_400', description: 'La syntaxe de la requête est erronée.' },
    ]);
    assert.throws(() => parseCalendarResponse(withError, 'TEMPO'), /ATM_HTTP_400/);
    assert.throws(() => parseCalendarResponse(apiResponse('TEMPO', []), 'EJP'), /option "EJP" absente/);
    const badDate = apiResponse('TEMPO', [{ dateApplication: '05/01/2026', statut: 'TEMPO_ROUGE' }]);
    assert.throws(() => parseCalendarResponse(badDate, 'TEMPO'), /date API invalide/);
});

test('daysByType : mapping Tempo, statuts par défaut ignorés, conversion et tri', () => {
    const entries = [
        { date: '2026-01-07', statut: 'TEMPO_BLANC' },
        { date: '2026-01-06', statut: 'TEMPO_ROUGE' },
        { date: '2026-01-05', statut: 'TEMPO_ROUGE' },
        { date: '2026-01-05', statut: 'TEMPO_ROUGE' }, // doublon (chevauchement de chunks)
        { date: '2026-01-08', statut: 'TEMPO_BLEU' },
        { date: '2026-07-21', statut: 'NON_DEFINI' },
    ];
    assert.deepStrictEqual(daysByType(entries, CALENDARS.TEMPO), {
        rouge: ['2026/01/05', '2026/01/06'],
        blanc: ['2026/01/07'],
    });
});

test('daysByType : config EJP et statut inconnu -> throw', () => {
    const entries = [
        { date: '2026-01-05', statut: 'EJP' },
        { date: '2026-01-06', statut: 'NON_EJP' },
        { date: '2026-04-01', statut: 'HORS_PERIODE_EJP' },
    ];
    assert.deepStrictEqual(daysByType(entries, CALENDARS.EJP), { rouge: ['2026/01/05'] });
    assert.throws(
        () => daysByType([{ date: '2026-01-05', statut: 'TEMPO_VIOLET' }], CALENDARS.TEMPO),
        /statut inconnu "TEMPO_VIOLET"/);
});

test('mergeDaysByType : la fenêtre re-fetchée est remplacée, le reste préservé', () => {
    const existing = {
        rouge: ['2024/01/10', '2026/01/05'],
        blanc: ['2024/01/11', '2026/01/06'],
    };
    const fetched = { rouge: ['2026/01/06'], blanc: [] }; // 06 passe blanc -> rouge, 05 redevient bleu
    const merged = mergeDaysByType(existing, fetched, ['2026/01/01', '2026/07/21']);
    assert.deepStrictEqual(merged, {
        rouge: ['2024/01/10', '2026/01/06'],
        blanc: ['2024/01/11'],
    });
});

test('diffDaysByType : ajouts et retraits par type', () => {
    const existing = { rouge: ['2020/01/07', '2021/01/07'], blanc: ['2021/02/01'] };
    const next = { rouge: ['2021/01/07', '2021/01/08'], blanc: ['2021/02/01'] };
    assert.deepStrictEqual(diffDaysByType(existing, next), {
        added: { rouge: ['2021/01/08'], blanc: [] },
        removed: { rouge: ['2020/01/07'], blanc: [] },
    });
});

test('serializeCalendarFile : format exact, dates triées/dédupliquées, idempotence', () => {
    const content = serializeCalendarFile(CALENDARS.TEMPO, {
        rouge: ['2020/12/07', '2020/12/02', '2020/12/07'],
        blanc: ['2020/11/23'],
    });

    assert.match(content, /^\/\/ Calendrier des jours Tempo \(EDF\)/);
    assert.match(content, /import\/tempo-update\.mjs/);
    assert.match(content, /defineCalendar\("tempo-edf", \{/);
    // Métadonnées préservées, rouge avant blanc.
    assert.match(content, /rouge: \{\n        numberOfDays: 22,\n        monthBegin: 11,\n        monthEnd: 3,/);
    assert.match(content, /blanc: \{\n        numberOfDays: 43,\n        monthBegin: 10,\n        monthEnd: 6,/);
    assert.ok(content.indexOf('rouge:') < content.indexOf('blanc:'));
    // Indentation exacte des dates (12 espaces), tri, dédup.
    assert.match(content, /\n            "2020\/12\/02",\n            "2020\/12\/07",\n/);
    assert.strictEqual(content.match(/"2020\/12\/07"/g).length, 1, 'dédupliqué');
    // Toutes les dates émises passent la validation de la factory.
    for (const [, date] of content.matchAll(/"([^"]+)",\n/g)) {
        assert.match(date, DATE_FORMAT);
    }
    // Idempotence.
    assert.strictEqual(serializeCalendarFile(CALENDARS.TEMPO, {
        rouge: ['2020/12/02', '2020/12/07'], blanc: ['2020/11/23'],
    }), content);
    assert.ok(content.endsWith('});\n'));
});

test('serializeCalendarFile : EJP, un seul type', () => {
    const content = serializeCalendarFile(CALENDARS.EJP, { rouge: ['2021/01/04'] });
    assert.match(content, /defineCalendar\("ejp-edf", \{/);
    assert.match(content, /Offre fermée à la souscription/);
    assert.doesNotMatch(content, /blanc:/);
});

test('yearlyChunks : tranches calendaires d\'au plus un an', () => {
    assert.deepStrictEqual(yearlyChunks('2020-11-01', '2022-07-21'), [
        ['2020-11-01', '2020-12-31'],
        ['2021-01-01', '2021-12-31'],
        ['2022-01-01', '2022-07-21'],
    ]);
    assert.deepStrictEqual(yearlyChunks('2026-04-05', '2026-07-21'), [
        ['2026-04-05', '2026-07-21'],
    ]);
    assert.deepStrictEqual(yearlyChunks('2026-07-22', '2026-07-21'), []);
});
