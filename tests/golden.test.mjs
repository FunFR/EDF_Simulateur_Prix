// Tests golden-master : figent le comportement actuel des tarifs sur le CSV réel.
// Ces snapshots ne doivent PAS changer pendant le refactoring des tarifs.
// Régénération volontaire : UPDATE_GOLDEN=1 node --test "tests/**/*.test.mjs"
import { test } from 'node:test';
import assert from 'node:assert';
import { runSimulation } from '../scripts/core/simulation.js';
import { installFreshRegistry, loadAbonnements } from './helpers/legacyLoader.mjs';
import { loadSampleData } from './helpers/csv.mjs';
import { defaultSettings } from './helpers/settings.mjs';
import { checkGolden, roundEuro, roundWh } from './helpers/golden.mjs';

const KVAS = [3, 6, 9, 12, 15, 18, 24, 30, 36];

const isEDF = abo => abo.name.includes('EDF');
const sumDays = (month, key) => month.days.reduce((total, day) => total + day[key], 0);

test('chargement : tous les scripts de tarifs d\'index.html se chargent sans erreur', () => {
    const abonnements = loadAbonnements();
    assert.ok(abonnements.length > 0);
    for (const abo of abonnements) {
        assert.strictEqual(typeof abo.name, 'string');
        assert.ok(Array.isArray(abo.prices) && abo.prices.length > 0, `${abo.name} : prices vide`);
        assert.strictEqual(typeof abo.getDayType, 'function', `${abo.name} : getDayType manquant`);
        assert.ok(Array.isArray(abo.hc), `${abo.name} : hc manquant`);
    }
});

for (const kva of KVAS) {
    test(`golden mensuel ${kva} kVA (réglages par défaut, tarifs EDF)`, () => {
        installFreshRegistry();
        const { calculatedMonths } = runSimulation(defaultSettings(kva), loadSampleData());

        const snapshot = {};
        for (const tarif of calculatedMonths) {
            snapshot[tarif.title] = tarif.allMonths.map(month => ({
                year: month.year,
                month: month.month,
                conso: roundWh(month.conso),
                price: roundEuro(month.price),
                hasErrors: month.hasErrors,
                nbDays: month.days.length,
                consoHC: roundWh(sumDays(month, 'consoHC')),
                priceHC: roundEuro(sumDays(month, 'priceHC')),
                consoHP: roundWh(sumDays(month, 'consoHP')),
                priceHP: roundEuro(sumDays(month, 'priceHP'))
            }));
        }
        checkGolden(`monthly-${kva}`, snapshot);
    });
}

test('golden journalier 9 kVA (décembre 2024 et janvier 2025)', () => {
    installFreshRegistry();
    const { calculatedMonths } = runSimulation(defaultSettings(9), loadSampleData());

    const snapshot = {};
    for (const tarif of calculatedMonths) {
        const months = tarif.allMonths.filter(m =>
            (m.year === 2024 && m.month === '12') || (m.year === 2025 && m.month === '01'));
        assert.strictEqual(months.length, 2, `${tarif.title} : fenêtre déc. 2024 / janv. 2025 incomplète`);
        snapshot[tarif.title] = months.flatMap(m => m.days.map(day => ({
            date: day.date,
            conso: roundWh(day.conso),
            price: roundEuro(day.price),
            consoHC: roundWh(day.consoHC),
            priceHC: roundEuro(day.priceHC),
            consoHP: roundWh(day.consoHP),
            priceHP: roundEuro(day.priceHP)
        })));
    }
    checkGolden('daily-9kva', snapshot);
});

test('golden dayTypes EDF : type de jour à 3h, 12h et 23h pour chaque date du CSV', () => {
    // Sans customisation : règles de jour telles que définies dans les fichiers.
    const abonnements = loadAbonnements().filter(isEDF);
    const dates = loadSampleData().map(day => day.date);

    const snapshot = {};
    for (const abo of abonnements) {
        const perDate = {};
        for (const date of dates) {
            const day = { date };
            perDate[date] = [
                abo.getDayType(day, { hour: 3, minute: 0 }),
                abo.getDayType(day, { hour: 12, minute: 0 }),
                abo.getDayType(day, { hour: 23, minute: 0 })
            ].join('/');
        }
        snapshot[abo.name] = perDate;
    }
    checkGolden('daytypes-edf', snapshot);
});

test('golden contrats EDF : champs statiques de chaque abonnement (grilles, plages, flags)', () => {
    const abonnements = loadAbonnements().filter(isEDF);

    const snapshot = abonnements.map(abo => {
        const contract = {
            name: abo.name,
            offer_type: abo.offer_type,
            lastUpdate: abo.lastUpdate,
            isCommunity: abo.isCommunity,
            subscription_url: abo.subscription_url,
            price_url: abo.price_url,
            prices: abo.prices,
            hc: abo.hc,
            // Flags normalisés en booléens : clé absente et false sont équivalents
            // pour le calculateur (ex. EJP legacy n'a pas la clé hasHCCustom).
            hasHCCustom: !!abo.hasHCCustom,
            hasSpecialDaysCustom: !!abo.hasSpecialDaysCustom,
            specialDays: abo.specialDays
        };
        if (Object.prototype.hasOwnProperty.call(abo, 'hcByDayType')) {
            contract.hcByDayType = abo.hcByDayType;
        }
        return contract;
    });
    checkGolden('contracts-edf', snapshot);
});
