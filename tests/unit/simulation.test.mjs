import { test } from 'node:test';
import assert from 'node:assert';
import { runSimulation } from '../../scripts/core/simulation.js';
import { defaultSettings } from '../helpers/settings.mjs';
import { makeFullDay, makeGrille } from '../helpers/makeDay.mjs';

// Registre de stubs : simulation.js lit window.abonnements via tarifsRegistry.
function installStubRegistry(abonnements) {
    globalThis.window = globalThis;
    globalThis.abonnements = abonnements;
    return abonnements;
}

const DATA = [makeFullDay('2024/03/05', 1000)];

test('hasHCCustom : les plages saisies remplacent hc (arrondi 23:59 -> 24:00, plage vide éliminée)', () => {
    const stub = makeGrille({ name: 'EDF - Stub HC', hasHCCustom: true, hc: [] });
    installStubRegistry([stub]);

    runSimulation(defaultSettings(6), DATA);

    assert.deepStrictEqual(stub.hc, [
        { start: { hour: 22, minute: 0 }, end: { hour: 24, minute: 0 } },
        { start: { hour: 0, minute: 0 }, end: { hour: 7, minute: 0 } }
        // la 3e plage 00:00 -> 00:00 est rejetée (start >= end)
    ]);
});

test('arrondi des plages : minutes > 30 font monter l\'heure, début >= fin rejeté', () => {
    const stub = makeGrille({ name: 'EDF - Stub HC', hasHCCustom: true, hc: [] });
    installStubRegistry([stub]);

    const settings = defaultSettings(6);
    settings.hcRawRanges = [
        ['06:40', '21:00'], // 06:40 -> 07:00
        ['10:20', '11:15'], // minutes <= 30 conservées telles quelles
        ['22:40', '23:20']  // 23:00 -> 23:20 : heures égales -> rejetée
    ];
    runSimulation(settings, DATA);

    assert.deepStrictEqual(stub.hc, [
        { start: { hour: 7, minute: 0 }, end: { hour: 21, minute: 0 } },
        { start: { hour: 10, minute: 20 }, end: { hour: 11, minute: 15 } }
    ]);
});

test('hasSpecialDaysCustom : jourZenPlus est poussé et s\'accumule entre simulations (comportement historique)', () => {
    const stub = makeGrille({ name: 'EDF - Stub Zen', hasSpecialDaysCustom: true, specialDays: [0, 6] });
    installStubRegistry([stub]);

    runSimulation(defaultSettings(6), DATA);
    assert.deepStrictEqual(stub.specialDays, [0, 6, 1]);

    runSimulation(defaultSettings(6), DATA);
    assert.deepStrictEqual(stub.specialDays, [0, 6, 1, 1], 'le push ne purge pas les valeurs précédentes');
});

test('filtre communautaire : sans opt-in, seuls les abonnements dont le nom contient "EDF"', () => {
    installStubRegistry([
        makeGrille({ name: 'EDF - Bleu Stub' }),
        makeGrille({ name: 'Autre - Fournisseur' })
    ]);

    const { calculatedMonths } = runSimulation(defaultSettings(6), DATA);
    assert.deepStrictEqual(calculatedMonths.map(t => t.title), ['EDF - Bleu Stub']);

    const settings = defaultSettings(6);
    settings.includeCommunity = true;
    const withCommunity = runSimulation(settings, DATA);
    assert.deepStrictEqual(withCommunity.calculatedMonths.map(t => t.title),
        ['EDF - Bleu Stub', 'Autre - Fournisseur']);
});

test('filtre par puissance souscrite : abonnement sans la puissance exclu', () => {
    installStubRegistry([
        makeGrille({ name: 'EDF - 6kVA seulement' }),
        makeGrille({
            name: 'EDF - 9kVA seulement',
            prices: [{ puissance: 9, abonnement: 20, bleu: { prixKwhHP: 20, prixKwhHC: 10 } }]
        })
    ]);

    const { calculatedMonths } = runSimulation(defaultSettings(6), DATA);
    assert.deepStrictEqual(calculatedMonths.map(t => t.title), ['EDF - 6kVA seulement']);
});
