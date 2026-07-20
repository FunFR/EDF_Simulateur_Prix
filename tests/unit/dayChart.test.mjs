// Tests du modèle de barres du graphe horaire (scripts/ui/dayChart.js).
// renderDayChart nécessite un DOM ; buildBars est pur et testé ici.
import { test } from 'node:test';
import assert from 'node:assert';
import { buildBars } from '../../scripts/ui/dayChart.js';

const TEMPO_DISPLAY = {
    types: {
        bleu: { day: 'bleu', bands: { HP: 'HP', HC: 'HC' } },
        rouge: { day: 'rouge', bands: { HP: 'HP', HC: 'HC' } }
    },
    dayOrder: ['bleu', 'rouge'],
    bandOrder: ['HP', 'HC']
};

test('buildBars : une barre par relevé, bande normalisée, libellé horaire', () => {
    const bars = buildBars({
        date: '2024/12/09',
        hours: [
            { time: { hour: 0, minute: 30 }, conso: 500.5, price: 0.01, type: 'bleu HC' },
            { time: { hour: 12, minute: 0 }, conso: 1000, price: 0.65, type: 'rouge HP' },
            { time: { hour: 24, minute: 0 }, conso: 250, price: 0.004, type: 'rouge HC' }
        ]
    }, TEMPO_DISPLAY);

    assert.strictEqual(bars.length, 3);
    assert.deepStrictEqual(bars.map(b => b.label), ['00:30', '12:00', '24:00']);
    assert.deepStrictEqual(bars.map(b => b.band.id), ['hc', 'hp', 'hc']);
    assert.strictEqual(bars[0].conso, 500.5);
    assert.strictEqual(bars.every(b => !b.error), true);
});

test('buildBars : relevé en erreur marqué, conso et prix null', () => {
    const bars = buildBars({
        date: '2024/12/09',
        hours: [{ time: { hour: 3, minute: 0 }, conso: NaN, price: NaN, type: 'bleu HC', hasErrors: true }]
    }, TEMPO_DISPLAY);

    assert.strictEqual(bars[0].error, true);
    assert.strictEqual(bars[0].conso, null);
    assert.strictEqual(bars[0].price, null);
});
