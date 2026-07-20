import { test } from 'node:test';
import assert from 'node:assert';
import vm from 'node:vm';
import fs from 'node:fs';
import { enedisCourbeParser } from '../../scripts/parsers/enedisCourbeParser.js';

const ROOT = new URL('../../', import.meta.url);

// Le snippet est un script autonome (collable dans une console navigateur) :
// on le charge dans un contexte vm avec le crochet de test, qui expose les
// fonctions pures sans lancer main().
function loadSnippetApi() {
    const sandbox = { __ENEDIS_EXPORT_TEST__: {}, console };
    sandbox.globalThis = sandbox;
    const code = fs.readFileSync(new URL('scripts/enedis-export/snippet.js', ROOT), 'utf8');
    new vm.Script(code, { filename: 'snippet.js' }).runInContext(vm.createContext(sandbox));
    return sandbox.__ENEDIS_EXPORT_TEST__.api;
}

const api = loadSnippetApi();

function loadFixture(name) {
    return JSON.parse(fs.readFileSync(new URL(`tests/fixtures/enedis/${name}`, ROOT), 'utf8'));
}

// Les objets créés dans le contexte vm ont des prototypes d'un autre realm :
// on les ramène à des objets locaux avant deepStrictEqual.
function plain(value) {
    return JSON.parse(JSON.stringify(value));
}

test('buildWindows : span de 7 jours inclusifs max, sans trou, bornées à maxMonths', () => {
    const windows = api.buildWindows(new Date(2026, 6, 20), 7, 25);

    assert.ok(windows.length > 100);
    assert.strictEqual(windows[0].fin, '2026-07-20');
    // premier span : 7 jours inclusifs = 6 jours d'écart (l'API renvoie un 500 au-delà)
    assert.strictEqual(windows[0].debut, '2026-07-14');
    // sans trou : le début d'une fenêtre est la fin de la suivante (1 jour de
    // chevauchement, dédoublonné par mergePoints)
    for (const [i, w] of windows.entries()) {
        if (i < windows.length - 1) assert.strictEqual(w.debut, windows[i + 1].fin);
        assert.ok(w.debut < w.fin);
        // aucune fenêtre ne dépasse 7 jours inclusifs
        const days = (new Date(w.fin) - new Date(w.debut)) / 86400000 + 1;
        assert.ok(days <= 7, `fenêtre de ${days} jours : ${w.debut} -> ${w.fin}`);
        assert.match(w.debut, /^\d{4}-\d{2}-\d{2}$/);
        assert.match(w.fin, /^\d{4}-\d{2}-\d{2}$/);
    }
    // butée : la fenêtre la plus ancienne s'arrête exactement à -25 mois
    assert.strictEqual(windows[windows.length - 1].debut, '2024-06-20');
});

test('extractIdPersonne : fixture, formes dégradées, null si introuvable', () => {
    assert.strictEqual(api.extractIdPersonne(loadFixture('userinfos.json')), 'AAA0000000000');
    // chemins nominaux
    assert.strictEqual(api.extractIdPersonne({ idPersonne: 'X1' }), 'X1');
    assert.strictEqual(api.extractIdPersonne({ userId: 42 }), '42');
    // clé renommée / imbriquée : trouvée par le parcours récursif
    assert.strictEqual(api.extractIdPersonne({ compte: { idPersonneAlex: 'Y2' } }), 'Y2');
    // rien de plausible
    assert.strictEqual(api.extractIdPersonne({ foo: 'bar', baz: [1, 2] }), null);
    assert.strictEqual(api.extractIdPersonne({}), null);
});

test('extractPoints : fixture nominale en W', () => {
    const points = api.extractPoints(loadFixture('courbe-7j.json'));

    assert.strictEqual(points.length, 6);
    assert.deepStrictEqual(plain(points[0]), { horodate: '2026-07-13T23:00:00+02:00', watt: 420 });
    assert.deepStrictEqual(plain(points[5]), { horodate: '2026-07-14T01:30:00+02:00', watt: 5210 });
});

test('extractPoints : normalisation des unités (kW, Wh sur 30 min)', () => {
    const kw = api.extractPoints({ unite: 'kW', points: [{ horodate: '2026-07-13T23:00:00', valeur: 1.5 }] });
    assert.strictEqual(kw[0].watt, 1500);

    const wh = api.extractPoints({ donnees: { unite: 'Wh', points: [{ horodate: '2026-07-13T23:00:00', valeur: 210 }] } });
    assert.strictEqual(wh[0].watt, 420);

    // unité portée par le point lui-même
    const inline = api.extractPoints({ points: [{ horodate: '2026-07-13T23:00:00', valeur: 2, unite: 'kW' }] });
    assert.strictEqual(inline[0].watt, 2000);
});

test('extractPoints : JSON inattendu -> tableau vide, sans exception', () => {
    assert.deepStrictEqual(plain(api.extractPoints({})), []);
    assert.deepStrictEqual(plain(api.extractPoints(null)), []);
    assert.deepStrictEqual(plain(api.extractPoints({ erreur: 'aucune donnée' })), []);
    assert.deepStrictEqual(plain(api.extractPoints([1, 2, 3])), []);
    // tableau d'objets sans horodate : ignoré
    assert.deepStrictEqual(plain(api.extractPoints({ liste: [{ valeur: 12 }] })), []);
});

test('mergePoints : dédoublonnage des chevauchements de fenêtres', () => {
    const map = new Map();
    const added1 = api.mergePoints(map, [
        { horodate: '2026-07-13T23:00:00+02:00', watt: 420 },
        { horodate: '2026-07-13T23:30:00+02:00', watt: 380 }
    ]);
    // même horodate re-reçue (autre fenêtre) : ignorée
    const added2 = api.mergePoints(map, [
        { horodate: '2026-07-13T23:30:00+01:00', watt: 9999 },
        { horodate: '2026-07-14T00:00:00+02:00', watt: 350 }
    ]);

    assert.strictEqual(added1, 2);
    assert.strictEqual(added2, 1);
    assert.strictEqual(map.size, 3);
    assert.strictEqual(map.get('2026-07-13T23:30:00'), 380);
});

test('buildCsv : tri chronologique, arrondi entier, nom de fichier', () => {
    const map = new Map([
        ['2026-07-14T00:00:00', 350.4],
        ['2026-07-13T23:00:00', 420],
        ['2026-07-13T23:30:00', 380]
    ]);
    const { filename, text } = api.buildCsv(map, '00000000000000', 'fin');

    assert.strictEqual(filename, 'conso-courbe-30min_00000000000000_20260713-20260714.csv');
    const lines = text.trim().split('\n');
    assert.strictEqual(lines[1], 'Horodate fin de pas;Puissance moyenne (W)');
    assert.deepStrictEqual(lines.slice(2), [
        '2026-07-13T23:00:00;420',
        '2026-07-13T23:30:00;380',
        '2026-07-14T00:00:00;350'
    ]);
});

test('buildCsv : mode "debut" décale les horodates de +30 min (fin de pas)', () => {
    const map = new Map([
        ['2026-07-13T23:30:00', 380],
        ['2026-07-13T00:00:00', 300]
    ]);
    const { text } = api.buildCsv(map, '00000000000000', 'debut');
    const lines = text.trim().split('\n').slice(2);

    assert.deepStrictEqual(lines, [
        '2026-07-13T00:30:00;300',
        '2026-07-14T00:00:00;380'   // franchit minuit
    ]);
});

test('round-trip : buildCsv -> enedisCourbeParser, 48 relevés sur le bon jour', () => {
    const map = new Map();
    // Fins de pas de 2026-07-13T00:30 à 2026-07-14T00:00 : une journée pleine.
    for (let i = 1; i <= 48; i++) {
        const totalMin = i * 30;
        const day = totalMin >= 24 * 60 ? '14' : '13';
        const h = String(Math.floor(totalMin / 60) % 24).padStart(2, '0');
        const m = String(totalMin % 60).padStart(2, '0');
        map.set(`2026-07-${day}T${h}:${m}:00`, 100 + i);
    }
    const { text } = api.buildCsv(map, '00000000000000', 'fin');
    const data = enedisCourbeParser.loadData(enedisCourbeParser.parseCSV(text));

    assert.strictEqual(data.length, 1);
    assert.strictEqual(data[0].date, '2026/07/13');
    assert.strictEqual(data[0].hours.length, 48);
    assert.ok(data[0].hours.some(h => h[0] === '24:00:00'));
    // valeurs entières en W, conservées
    for (const [, value] of data[0].hours) {
        assert.match(value, /^\d+$/);
    }
});
