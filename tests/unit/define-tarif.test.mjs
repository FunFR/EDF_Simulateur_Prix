// Tests de la factory declarative defineTarif / defineCalendar
// (scripts/tarifs-lib/define-tarif.js) : contrat généré et validation.
import { test } from 'node:test';
import assert from 'node:assert';
import { createTarifSandbox } from '../helpers/legacyLoader.mjs';

const LIB = ['scripts/tarifs-lib/define-tarif.js'];

function freshSandbox() {
    return createTarifSandbox({ files: LIB });
}

// Les objets créés dans le contexte vm ont les prototypes d'un autre realm :
// round-trip JSON avant deepStrictEqual.
function plain(value) {
    return JSON.parse(JSON.stringify(value));
}

// Définition de base valide (tarif HP/HC constant), à surcharger dans les tests.
function validDef(overrides = {}) {
    return {
        name: 'TEST - Tarif',
        offer_type: 'Marché',
        lastUpdate: '2026-02-01',
        isCommunity: true,
        subscription_url: 'https://example.org/souscrire',
        price_url: 'https://example.org/grille.pdf',
        subscriptions: { 6: 15.65, 9: 19.56 },
        dayTypes: { bleu: { HP: 20.65, HC: 15.79 } },
        dayRule: { type: 'constant', dayType: 'bleu' },
        hcRanges: [{ from: '22:00', to: '24:00' }, { from: '00:00', to: '06:00' }],
        ...overrides
    };
}

function expectError(def, fragment, sandbox = freshSandbox()) {
    assert.throws(() => sandbox.defineTarif(def), (error) => {
        assert.match(error.message, new RegExp(fragment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
            `message d'erreur attendu contenant « ${fragment} », reçu : ${error.message}`);
        return true;
    });
    assert.ok(sandbox.tarifDefinitionErrors.length > 0, 'l\'erreur doit être accumulée dans tarifDefinitionErrors');
}

test('constant : contrat legacy généré (prices, hc, flags, getDayType)', () => {
    const sandbox = freshSandbox();
    const abo = sandbox.defineTarif(validDef());

    assert.strictEqual(sandbox.abonnements.length, 1);
    assert.strictEqual(sandbox.abonnements[0], abo);
    assert.deepStrictEqual(plain(abo).prices, [
        { puissance: 6, abonnement: 15.65, bleu: { prixKwhHP: 20.65, prixKwhHC: 15.79 } },
        { puissance: 9, abonnement: 19.56, bleu: { prixKwhHP: 20.65, prixKwhHC: 15.79 } }
    ]);
    assert.deepStrictEqual(plain(abo).hc, [
        { start: { hour: 22, minute: 0 }, end: { hour: 24, minute: 0 } },
        { start: { hour: 0, minute: 0 }, end: { hour: 6, minute: 0 } }
    ]);
    assert.strictEqual(abo.hasHCCustom, false);
    assert.strictEqual(abo.hasSpecialDaysCustom, false);
    assert.deepStrictEqual(plain(abo).specialDays, []);
    assert.strictEqual(abo.getDayType({ date: '2024/07/15' }, { hour: 12, minute: 0 }), 'bleu');
});

test('prix unique { price } : hc = journée entière, prixKwhHC seul, hcRanges omis', () => {
    const sandbox = freshSandbox();
    const abo = sandbox.defineTarif(validDef({
        dayTypes: { bleu: { price: 19.27 } },
        hcRanges: undefined
    }));

    assert.deepStrictEqual(plain(abo).prices[0].bleu, { prixKwhHC: 19.27 });
    assert.deepStrictEqual(plain(abo).hc, [{ start: { hour: 0, minute: 0 }, end: { hour: 24, minute: 0 } }]);
});

test('priceOverrides : surcharge par puissance (cas EDF Bleu 3/6 kVA)', () => {
    const sandbox = freshSandbox();
    const abo = sandbox.defineTarif(validDef({
        subscriptions: { 3: 12.03, 6: 15.65, 9: 19.56 },
        dayTypes: { bleu: { price: 19.27 } },
        priceOverrides: { 3: { bleu: { price: 19.40 } }, 6: { bleu: { price: 19.40 } } },
        hcRanges: undefined
    }));

    assert.deepStrictEqual(plain(abo).prices.map(p => p.bleu.prixKwhHC), [19.40, 19.40, 19.27]);
});

test('hcRanges "custom" : hasHCCustom true et hc vide (rempli par la simulation)', () => {
    const sandbox = freshSandbox();
    const abo = sandbox.defineTarif(validDef({ hcRanges: 'custom' }));

    assert.strictEqual(abo.hasHCCustom, true);
    assert.deepStrictEqual(plain(abo).hc, []);
});

test('weekly : specialDays = jours de semaine, getDayType via getDay()', () => {
    const sandbox = freshSandbox();
    const abo = sandbox.defineTarif(validDef({
        dayTypes: { bleu: { price: 20.38 }, weekend: { price: 15.38 } },
        dayRule: { type: 'weekly', default: 'bleu', days: { weekend: [0, 6] } },
        hcRanges: undefined
    }));

    assert.deepStrictEqual(plain(abo).specialDays, [0, 6]);
    assert.strictEqual(abo.hasSpecialDaysCustom, false);
    assert.strictEqual(abo.getDayType({ date: '2026/07/11' }), 'weekend'); // samedi
    assert.strictEqual(abo.getDayType({ date: '2026/07/13' }), 'bleu');    // lundi

    // La personnalisation utilisateur pousse un jour dans specialDays (simulation.js)
    abo.specialDays.push(1);
    assert.strictEqual(abo.getDayType({ date: '2026/07/13' }), 'weekend');
});

test('weekly + userDaySetting : hasSpecialDaysCustom true', () => {
    const sandbox = freshSandbox();
    const abo = sandbox.defineTarif(validDef({
        dayTypes: { bleu: { price: 21.33 }, weekend: { price: 16.04 } },
        dayRule: { type: 'weekly', default: 'bleu', days: { weekend: [0, 6] }, userDaySetting: 'jourZenPlus' },
        hcRanges: undefined
    }));
    assert.strictEqual(abo.hasSpecialDaysCustom, true);
});

test('calendar : specialDays au format legacy, règle "avant Nh = veille" optionnelle', () => {
    const sandbox = freshSandbox();
    sandbox.defineCalendar('test-cal', {
        rouge: { numberOfDays: 22, monthBegin: 11, monthEnd: 3, days: ['2026/01/07'] },
        blanc: { numberOfDays: 43, monthBegin: 10, monthEnd: 6, days: ['2026/01/08'] }
    });

    const withRule = sandbox.defineTarif(validDef({
        name: 'TEST - Avec veille',
        dayTypes: { bleu: { HP: 16.12, HC: 13.25 }, rouge: { HP: 70.60, HC: 15.75 }, blanc: { HP: 18.71, HC: 14.99 } },
        dayRule: { type: 'calendar', default: 'bleu', calendar: 'test-cal', previousDayBefore: 6 }
    }));

    assert.deepStrictEqual(plain(withRule.specialDays), [
        { name: 'rouge', numberOfDays: 22, monthBegin: 11, monthEnd: 3, lastDays: ['2026/01/07'] },
        { name: 'blanc', numberOfDays: 43, monthBegin: 10, monthEnd: 6, lastDays: ['2026/01/08'] }
    ]);
    assert.strictEqual(withRule.getDayType({ date: '2026/01/07' }, { hour: 12, minute: 0 }), 'rouge');
    assert.strictEqual(withRule.getDayType({ date: '2026/01/08' }, { hour: 5, minute: 30 }), 'rouge', 'avant 6h : couleur de la veille');
    assert.strictEqual(withRule.getDayType({ date: '2026/01/08' }, { hour: 6, minute: 0 }), 'blanc');
    assert.strictEqual(withRule.getDayType({ date: '2026/01/07' }, { hour: 24, minute: 0 }), 'rouge', '24h n\'est pas < 6h');

    const withoutRule = sandbox.defineTarif(validDef({
        name: 'TEST - Sans veille',
        dayTypes: { bleu: { HP: 17.81, HC: 17.81 }, rouge: { HP: 34.40, HC: 17.81 }, blanc: { HP: 18.71, HC: 14.99 } },
        dayRule: { type: 'calendar', default: 'bleu', calendar: 'test-cal' }
    }));
    assert.strictEqual(withoutRule.getDayType({ date: '2026/01/08' }, { hour: 5, minute: 0 }), 'blanc', 'pas de report sans previousDayBefore');
});

test('season : saisons par mois, sous-types horaires, hcRanges byDayType', () => {
    const sandbox = freshSandbox();
    const abo = sandbox.defineTarif(validDef({
        dayTypes: {
            hiver: { HP: 26.27, HC: 20.62 },
            hiverSC: { HP: 19.28, HC: 19.28 },
            ete: { HP: 15.22, HC: 13.04 },
            eteSC: { HP: 9.87, HC: 9.87 }
        },
        dayRule: {
            type: 'season',
            seasons: { hiver: { months: [11, 12, 1, 2, 3] }, ete: { months: [4, 5, 6, 7, 8, 9, 10] } },
            previousDayBefore: 6,
            hourSubTypes: {
                ete: [{ fromHour: 11, toHour: 18, dayType: 'eteSC' }],
                hiver: [
                    { fromHour: 22, toHour: 24, dayType: 'hiverSC' },
                    { fromHour: 0, toHour: 7, dayType: 'hiverSC' }
                ]
            }
        },
        hcRanges: {
            byDayType: {
                hiver: [{ from: '11:00', to: '18:00' }],
                hiverSC: [{ from: '22:00', to: '24:00' }, { from: '00:00', to: '07:00' }],
                ete: [{ from: '00:00', to: '07:00' }],
                eteSC: [{ from: '11:00', to: '18:00' }]
            }
        }
    }));

    assert.deepStrictEqual(plain(abo).hc, []);
    assert.deepStrictEqual(plain(abo).hcByDayType.hiverSC, [
        { start: { hour: 22, minute: 0 }, end: { hour: 24, minute: 0 } },
        { start: { hour: 0, minute: 0 }, end: { hour: 7, minute: 0 } }
    ]);

    const at = (hour, minute = 0) => ({ hour, minute });
    assert.strictEqual(abo.getDayType({ date: '2024/10/31' }, at(9)), 'ete');
    assert.strictEqual(abo.getDayType({ date: '2024/11/01' }, at(9)), 'hiver');
    assert.strictEqual(abo.getDayType({ date: '2024/11/01' }, at(3)), 'ete', 'avant 6h : saison de la veille (mais heure brute pour les sous-types)');
    assert.strictEqual(abo.getDayType({ date: '2024/07/15' }, at(11)), 'eteSC');
    assert.strictEqual(abo.getDayType({ date: '2024/07/15' }, at(18)), 'ete');
    assert.strictEqual(abo.getDayType({ date: '2024/12/15' }, at(22)), 'hiverSC');
    assert.strictEqual(abo.getDayType({ date: '2024/12/15' }, at(24)), 'hiver', '24h hors plage 22-24 (comportement historique)');
});

test('validation : métadonnées manquantes ou invalides', () => {
    expectError(validDef({ name: '' }), 'name manquant');
    expectError(validDef({ lastUpdate: '01/02/2026' }), 'lastUpdate');
    expectError(validDef({ isCommunity: undefined }), 'isCommunity');
    expectError(validDef({ price_url: '' }), 'price_url');
});

test('validation : grilles de prix', () => {
    expectError(validDef({ subscriptions: {} }), 'subscriptions manquant');
    expectError(validDef({ subscriptions: { 6: '15.65' } }), 'subscriptions[6]');
    expectError(validDef({ dayTypes: { bleu: { HP: 20.65 } } }), 'clés attendues');
    expectError(validDef({ dayTypes: { bleu: { price: 10 }, rouge: { HP: 20, HC: 10 } }, dayRule: { type: 'constant', dayType: 'bleu' } }), 'mélange interdit');
    expectError(validDef({ priceOverrides: { 12: { bleu: { HP: 1, HC: 1 } } } }), 'puissance absente de subscriptions');
});

test('validation : dayRule', () => {
    expectError(validDef({ dayRule: { type: 'spot' } }), 'pas encore supporté');
    expectError(validDef({ dayRule: { type: 'inconnu' } }), 'dayRule.type inconnu');
    expectError(validDef({ dayRule: { type: 'constant', dayType: 'rouge' } }), 'absent de dayTypes');
    expectError(validDef({
        dayTypes: { bleu: { HP: 20, HC: 10 }, oublie: { HP: 1, HC: 1 } },
        dayRule: { type: 'constant', dayType: 'bleu' }
    }), 'jamais utilisé par dayRule');
    expectError(validDef({
        dayRule: { type: 'calendar', default: 'bleu', calendar: 'nexiste-pas' }
    }), 'calendrier inconnu');
    expectError(validDef({
        dayTypes: { hiver: { HP: 2, HC: 1 }, ete: { HP: 2, HC: 1 } },
        dayRule: { type: 'season', seasons: { hiver: { months: [11, 12, 1, 2, 3] }, ete: { months: [4, 5, 6, 7, 8, 9] } } },
        hcRanges: { byDayType: { hiver: [], ete: [] } }
    }), 'mois 10 couvert par aucune saison');
});

test('validation : plages horaires', () => {
    expectError(validDef({ hcRanges: undefined }), 'hcRanges manquant');
    expectError(validDef({ dayTypes: { bleu: { price: 10 } }, hcRanges: [{ from: '22:00', to: '24:00' }] }), 'à omettre');
    expectError(validDef({ hcRanges: [{ from: '22:00', to: '22:00' }] }), 'plage vide');
    expectError(validDef({ hcRanges: [{ from: '22:15', to: '24:00' }] }), 'plage invalide');
    expectError(validDef({ hcRanges: [{ from: '22:00', to: '24:30' }] }), 'plage invalide');
});

test('validation : defineCalendar (dates, redéfinition)', () => {
    const sandbox = freshSandbox();
    assert.throws(() => sandbox.defineCalendar('bad', { rouge: { days: ['07/01/2026'] } }), /date invalide/);
    sandbox.defineCalendar('ok', { rouge: { days: ['2026/01/07'] } });
    assert.throws(() => sandbox.defineCalendar('ok', { rouge: { days: ['2026/01/08'] } }), /déjà défini/);
});

test('un tarif en erreur n\'est pas poussé dans le registre', () => {
    const sandbox = freshSandbox();
    assert.throws(() => sandbox.defineTarif(validDef({ name: '' })));
    assert.strictEqual(sandbox.abonnements.length, 0);
});
