// Tests du module de présentation des tarifs (scripts/ui/tariffDisplay.js) :
// normalisation des clés de bandes/jours, colonnes, agrégation journalière.
import { test } from 'node:test';
import assert from 'node:assert';
import { splitHourType, bandInfo, dayBadge, bandColumns, hourBand, buildDayModel } from '../../scripts/ui/tariffDisplay.js';

test('splitHourType : découpe sur le dernier espace', () => {
    assert.deepStrictEqual(splitHourType('rouge HC'), { engineType: 'rouge', hc: true });
    assert.deepStrictEqual(splitHourType('hscHiver HP'), { engineType: 'hscHiver', hc: false });
});

test('bandInfo : normalisation des clés de bande', () => {
    assert.strictEqual(bandInfo('HP').id, 'hp');
    assert.strictEqual(bandInfo('HC').id, 'hc');
    assert.strictEqual(bandInfo('hsc').id, 'hsc');
    assert.strictEqual(bandInfo('hscEte').id, 'hsc');
    assert.strictEqual(bandInfo('hiverSC').id, 'hsc', 'suffixe SC (Zen Estival)');
    assert.strictEqual(bandInfo('hpHiver').id, 'hp');
    assert.strictEqual(bandInfo('hcEte').id, 'hc');
    assert.strictEqual(bandInfo('happy').id, 'happy');
    assert.strictEqual(bandInfo('bleu').id, 'base', 'jour à prix unique = Prix unique');
    assert.strictEqual(bandInfo('weekend').id, 'base');
    const unknown = bandInfo('mystere');
    assert.strictEqual(unknown.id, 'mystere', 'clé inconnue conservée');
    assert.strictEqual(unknown.label, 'mystere');
    assert.ok(unknown.color, 'repli neutre coloré');
    assert.ok(bandInfo('HP').label.length > 0 && bandInfo('HP').color.startsWith('#'));
});

test('dayBadge : libellés, strip de préfixe, replis', () => {
    assert.strictEqual(dayBadge(null), null, 'pas de badge pour un jour null');
    assert.deepStrictEqual(dayBadge('rouge').label, 'Rouge');
    assert.strictEqual(dayBadge('hcEte').id, 'ete', 'hcEte -> saison été');
    assert.strictEqual(dayBadge('hscHiver').id, 'hiver');
    assert.strictEqual(dayBadge('hiverWeekend').label, 'W-E hiver');
    const unknown = dayBadge('exotique');
    assert.strictEqual(unknown.label, 'exotique', 'repli neutre');
    assert.ok(dayBadge('ete').ink, 'couleur de texte fournie');
});

test('bandColumns : déduplication, normalisation et ordre stable', () => {
    // type vert_HSC : 6 clés brutes -> 3 colonnes hp, hc, hsc
    const display = {
        types: {},
        dayOrder: ['hcEte', 'hscHiver'],
        bandOrder: ['hpEte', 'hscEte', 'hcEte', 'hpHiver', 'hscHiver', 'hcHiver']
    };
    assert.deepStrictEqual(bandColumns(display).map(b => b.id), ['hp', 'hc', 'hsc']);

    // Base : bande unique
    assert.deepStrictEqual(
        bandColumns({ types: {}, dayOrder: [], bandOrder: ['bleu'] }).map(b => b.id),
        ['base']);

    // Charge'Heures : HP, HC puis super creuses
    assert.deepStrictEqual(
        bandColumns({ types: {}, dayOrder: [], bandOrder: ['HP', 'HC', 'hsc'] }).map(b => b.id),
        ['hp', 'hc', 'hsc']);
});

const TEMPO_DISPLAY = {
    types: {
        bleu: { day: 'bleu', bands: { HP: 'HP', HC: 'HC' } },
        rouge: { day: 'rouge', bands: { HP: 'HP', HC: 'HC' } }
    },
    dayOrder: ['bleu', 'rouge'],
    bandOrder: ['HP', 'HC']
};

test('hourBand : bande normalisée d\'un relevé', () => {
    assert.strictEqual(hourBand('rouge HP', TEMPO_DISPLAY).id, 'hp');
    assert.strictEqual(hourBand('rouge HC', TEMPO_DISPLAY).id, 'hc');
    // type moteur absent de la table : repli sur la clé brute
    assert.strictEqual(hourBand('bleu HC', { types: {}, dayOrder: [], bandOrder: [] }).id, 'base');
});

test('buildDayModel : badge de midi et agrégats par bande (NaN exclus)', () => {
    const day = {
        date: '2024/12/09',
        hours: [
            { time: { hour: 3, minute: 0 }, conso: 500, price: 0.01, type: 'bleu HC' }, // nuit : veille bleue
            { time: { hour: 12, minute: 0 }, conso: 1000, price: 0.65, type: 'rouge HP' },
            { time: { hour: 22, minute: 0 }, conso: NaN, price: NaN, type: 'rouge HC', hasErrors: true }
        ]
    };
    const model = buildDayModel(day, TEMPO_DISPLAY);
    assert.strictEqual(model.badge.id, 'rouge', 'badge pris au relevé de midi, pas à la nuit reportée');
    assert.deepStrictEqual(model.byBand.hc, { conso: 500, price: 0.01 });
    assert.deepStrictEqual(model.byBand.hp, { conso: 1000, price: 0.65 });
});

test('buildDayModel : jour en erreur (aucun relevé) et tarif sans badge', () => {
    assert.deepStrictEqual(buildDayModel({ date: '2024/03/05', hours: [] }, TEMPO_DISPLAY),
        { badge: null, byBand: {} });

    const singleDay = {
        types: { bleu: { day: null, bands: { HP: 'bleu', HC: 'bleu' } } },
        dayOrder: [],
        bandOrder: ['bleu']
    };
    const model = buildDayModel({
        date: '2024/03/05',
        hours: [{ time: { hour: 12, minute: 0 }, conso: 800, price: 0.15, type: 'bleu HC' }]
    }, singleDay);
    assert.strictEqual(model.badge, null, 'dayOrder vide : pas de badge');
    assert.deepStrictEqual(model.byBand.base, { conso: 800, price: 0.15 });
});
