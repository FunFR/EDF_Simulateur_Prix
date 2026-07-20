// Tests du module de présentation des tarifs (scripts/ui/tariffDisplay.js) :
// normalisation des clés de bandes/jours, colonnes, agrégation journalière.
import { test } from 'node:test';
import assert from 'node:assert';
import { splitHourType, bandInfo, dayBadge, bandColumns, hourBand, buildDayModel, buildPeriodShare } from '../../scripts/ui/tariffDisplay.js';

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

// --- buildPeriodShare : répartition de la conso d'une période par tranche ---

const hourAt = (hour, conso, type) => ({ time: { hour: hour, minute: 0 }, conso: conso, price: 0, type: type });
const monthOf = (...days) => ({ days: days.map(hours => ({ hours: hours })) });

const HPHC_DISPLAY = {
    types: { base: { day: null, bands: { HP: 'HP', HC: 'HC' } } },
    dayOrder: [],
    bandOrder: ['HP', 'HC']
};

test('buildPeriodShare : HP/HC simple, cumul multi-mois', () => {
    const share = buildPeriodShare([
        monthOf([hourAt(2, 3000, 'base HC'), hourAt(12, 6000, 'base HP')]),
        monthOf([hourAt(3, 400, 'base HC'), hourAt(14, 600, 'base HP')])
    ], HPHC_DISPLAY);
    assert.strictEqual(share.total, 10000);
    assert.deepStrictEqual(share.segments.map(s => s.key), ['|hp', '|hc'], 'HP avant HC');
    assert.deepStrictEqual(share.segments.map(s => s.label), ['HP', 'HC']);
    assert.deepStrictEqual(share.segments.map(s => s.longLabel), ['Heures pleines', 'Heures creuses']);
    assert.deepStrictEqual(share.segments.map(s => s.conso), [6600, 3400]);
    assert.deepStrictEqual(share.segments.map(s => s.pct), [66, 34]);
    assert.strictEqual(share.segments[0].color, bandInfo('HP').color, 'sans jours : couleur de bande du registre');
});

test('buildPeriodShare : Tempo jour×tranche, attribution par relevé', () => {
    // Un même jour civil mélange nuit bleue reportée et jour rouge.
    const share = buildPeriodShare([monthOf(
        [hourAt(3, 500, 'bleu HC'), hourAt(12, 1000, 'rouge HP')],
        [hourAt(12, 1500, 'bleu HP'), hourAt(23, 1000, 'bleu HC')]
    )], TEMPO_DISPLAY);
    assert.deepStrictEqual(share.segments.map(s => s.key), ['bleu|hp', 'bleu|hc', 'rouge|hp'],
        'ordre dayOrder puis bande');
    assert.deepStrictEqual(share.segments.map(s => s.label), ['Bleu HP', 'Bleu HC', 'Rouge HP']);
    assert.strictEqual(share.segments[0].longLabel, 'Bleu — Heures pleines');
    assert.deepStrictEqual(share.segments.map(s => s.conso), [1500, 1500, 1000]);
    assert.strictEqual(share.segments[0].color, dayBadge('bleu').color, 'HP : couleur du jour telle quelle');
    assert.strictEqual(share.segments[2].color, dayBadge('rouge').color);
    assert.notStrictEqual(share.segments[1].color, share.segments[0].color, 'HC : teinte du jour éclaircie');
    assert.match(share.segments[1].color, /^#[0-9a-f]{6}$/);
});

test('buildPeriodShare : null si mono-tranche ou répartition non informative', () => {
    const baseDisplay = {
        types: { bleu: { day: null, bands: { HP: 'bleu', HC: 'bleu' } } },
        dayOrder: [],
        bandOrder: ['bleu']
    };
    assert.strictEqual(buildPeriodShare([monthOf([hourAt(12, 800, 'bleu HP')])], baseDisplay), null,
        'tarif Base : rien à afficher');

    const share = buildPeriodShare([monthOf([hourAt(12, 800, 'base HP'), hourAt(2, 0, 'base HC')])], HPHC_DISPLAY);
    assert.strictEqual(share, null, 'un seul segment non nul');

    assert.strictEqual(buildPeriodShare([monthOf([])], HPHC_DISPLAY), null, 'aucun relevé');
});

test('buildPeriodShare : pourcentages entiers sommant à 100', () => {
    // Trois bandes à parts égales : plus fort reste -> 34/33/33.
    const threeBands = {
        types: {
            n: { day: null, bands: { HP: 'HP', HC: 'HC' } },
            s: { day: null, bands: { HP: 'hsc', HC: 'hsc' } }
        },
        dayOrder: [],
        bandOrder: ['HP', 'HC', 'hsc']
    };
    const equal = buildPeriodShare([monthOf([
        hourAt(12, 1000, 'n HP'), hourAt(2, 1000, 'n HC'), hourAt(4, 1000, 's HC')
    ])], threeBands);
    assert.deepStrictEqual(equal.segments.map(s => s.pct), [34, 33, 33]);

    // Segment minuscule (0,3 %) : pct 0 mais conso conservée.
    const tiny = buildPeriodShare([monthOf([
        hourAt(12, 9970, 'base HP'), hourAt(2, 30, 'base HC')
    ])], HPHC_DISPLAY);
    assert.deepStrictEqual(tiny.segments.map(s => s.pct), [100, 0]);
    assert.strictEqual(tiny.segments[1].conso, 30);
});

test('buildPeriodShare : jours ordonnés selon le registre, pas selon le tarif', () => {
    // Tempo définit rouge avant blanc : l'affichage garde Bleu, Blanc, Rouge.
    const display = {
        types: {
            bleu: { day: 'bleu', bands: { HP: 'HP', HC: 'HC' } },
            rouge: { day: 'rouge', bands: { HP: 'HP', HC: 'HC' } },
            blanc: { day: 'blanc', bands: { HP: 'HP', HC: 'HC' } }
        },
        dayOrder: ['bleu', 'rouge', 'blanc'],
        bandOrder: ['HP', 'HC']
    };
    const share = buildPeriodShare([monthOf([
        hourAt(12, 100, 'rouge HP'), hourAt(13, 100, 'blanc HP'), hourAt(14, 100, 'bleu HP')
    ])], display);
    assert.deepStrictEqual(share.segments.map(s => s.label), ['Bleu HP', 'Blanc HP', 'Rouge HP']);
});

test('buildPeriodShare : fenêtre horaire nommée sous un jour, et jour clair assombri', () => {
    // Type Zen Estival : la saison porte HP/HC et une fenêtre super creuses.
    const estival = {
        types: {
            hiver: { day: 'hiver', bands: { HP: 'HP', HC: 'HC' } },
            hscHiver: { day: 'hiver', bands: { HP: 'hscHiver', HC: 'hscHiver' } }
        },
        dayOrder: ['hiver', 'hscHiver'],
        bandOrder: ['HP', 'HC', 'hscHiver']
    };
    const share = buildPeriodShare([monthOf([
        hourAt(12, 500, 'hiver HP'), hourAt(22, 300, 'hiver HC'), hourAt(3, 200, 'hscHiver HP')
    ])], estival);
    assert.deepStrictEqual(share.segments.map(s => s.label), ['Hiver HP', 'Hiver HC', 'Hiver HSC'],
        'la bande super creuses reste nommée, contrairement à un jour à prix unique');
    const colors = share.segments.map(s => s.color);
    assert.strictEqual(new Set(colors).size, 3, 'trois déclinaisons distinctes de la teinte du jour');

    // Jour Blanc (déjà presque blanc) : la variante HC est assombrie, pas éclaircie.
    const tempoShare = buildPeriodShare([monthOf([
        hourAt(12, 500, 'blanc HP'), hourAt(2, 500, 'blanc HC'), hourAt(13, 100, 'bleu HP')
    ])], {
        types: {
            bleu: { day: 'bleu', bands: { HP: 'HP', HC: 'HC' } },
            blanc: { day: 'blanc', bands: { HP: 'HP', HC: 'HC' } }
        },
        dayOrder: ['bleu', 'blanc'],
        bandOrder: ['HP', 'HC']
    });
    const blancHP = tempoShare.segments.find(s => s.label === 'Blanc HP');
    const blancHC = tempoShare.segments.find(s => s.label === 'Blanc HC');
    assert.strictEqual(blancHP.color, dayBadge('blanc').color);
    assert.ok(parseInt(blancHC.color.slice(1), 16) < parseInt(blancHP.color.slice(1), 16),
        'Blanc HC plus sombre que Blanc HP');
});

test('buildPeriodShare : NaN ignorés, jour à prix unique libellé par le jour', () => {
    const ejpDisplay = {
        types: {
            normal: { day: 'normal', bands: { HP: 'normal', HC: 'normal' } },
            pointe: { day: 'pointe', bands: { HP: 'pointe', HC: 'pointe' } }
        },
        dayOrder: ['normal', 'pointe'],
        bandOrder: ['normal', 'pointe']
    };
    const share = buildPeriodShare([monthOf([
        hourAt(12, 8000, 'normal HP'),
        hourAt(14, 2000, 'pointe HP'),
        hourAt(15, NaN, 'pointe HP')
    ])], ejpDisplay);
    assert.strictEqual(share.total, 10000, 'relevés NaN exclus du total');
    assert.deepStrictEqual(share.segments.map(s => s.label), ['normal', 'pointe'],
        'prix unique : libellé du jour seul, sans suffixe de bande');
    assert.deepStrictEqual(share.segments.map(s => s.pct), [80, 20]);
});
