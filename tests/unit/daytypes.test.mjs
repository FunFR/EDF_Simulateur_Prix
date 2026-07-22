// Fige les règles getDayType des tarifs EDF chargés depuis les vrais fichiers,
// y compris les asymétries historiques (règle "avant 6h = veille" présente sur
// Tempo et Zen Estival, absente sur EJP et Zen Week-End Option Flex).
import { test } from 'node:test';
import assert from 'node:assert';
import { loadAbonnements } from '../helpers/legacyLoader.mjs';

const abonnements = loadAbonnements();
const byName = name => {
    const abo = abonnements.find(a => a.name === name);
    assert.ok(abo, `abonnement introuvable : ${name}`);
    return abo;
};
const at = (hour, minute = 0) => ({ hour, minute });

test('Tempo : avant 6h la couleur est celle de la veille', () => {
    const tempo = byName('EDF - Tempo');

    // 2026/01/07 est rouge, 2026/01/08 est blanc
    assert.strictEqual(tempo.getDayType({ date: '2026/01/08' }, at(5, 30)), 'rouge');
    assert.strictEqual(tempo.getDayType({ date: '2026/01/08' }, at(6)), 'blanc');
    assert.strictEqual(tempo.getDayType({ date: '2026/01/08' }, at(12)), 'blanc');
    // 24:00 (minuit rattaché à la veille par le parser) n'est PAS < 6h : date du jour
    assert.strictEqual(tempo.getDayType({ date: '2026/01/07' }, at(24)), 'rouge');
    // jour non listé -> bleu
    assert.strictEqual(tempo.getDayType({ date: '2024/07/15' }, at(12)), 'bleu');
    assert.strictEqual(tempo.getDayType({ date: '2024/07/15' }, at(3)), 'bleu');
});

test('EJP : pas de règle 6h, la date du jour est utilisée telle quelle', () => {
    const ejp = byName('EDF - EJP');

    // 2025/03/14 est un jour de pointe
    assert.strictEqual(ejp.getDayType({ date: '2025/03/14' }, at(5)), 'rouge');
    assert.strictEqual(ejp.getDayType({ date: '2025/03/15' }, at(5)), 'bleu', 'EJP ne reporte pas la couleur de la veille');
    assert.strictEqual(ejp.getDayType({ date: '2025/03/14' }, at(12)), 'rouge');
});

test('Zen Week-End : samedi et dimanche -> weekend', () => {
    const zenWE = byName('EDF - Zen Week-End');

    assert.strictEqual(zenWE.getDayType({ date: '2026/07/11' }), 'weekend'); // samedi
    assert.strictEqual(zenWE.getDayType({ date: '2026/07/12' }), 'weekend'); // dimanche
    assert.strictEqual(zenWE.getDayType({ date: '2026/07/10' }), 'bleu');    // vendredi
    assert.strictEqual(zenWE.getDayType({ date: '2026/07/13' }), 'bleu');    // lundi
});

test('Zen Week-End Plus : le jour personnalisé poussé dans specialDays devient weekend', () => {
    const zenWEPlus = byName('EDF - Zen Week-End Plus');
    assert.strictEqual(zenWEPlus.hasSpecialDaysCustom, true);

    assert.strictEqual(zenWEPlus.getDayType({ date: '2026/07/13' }), 'bleu'); // lundi avant customisation
    zenWEPlus.specialDays.push(1); // ce que fait addCustomisationToAbonnements avec jourZenPlus=1
    assert.strictEqual(zenWEPlus.getDayType({ date: '2026/07/13' }), 'weekend');
});

test('Zen Week-End Option Flex : calendrier sobriete sans règle 6h', () => {
    const flex = byName('EDF - Zen Week-End Option Flex');
    assert.strictEqual(flex.hasSpecialDaysCustom, false);

    // 2026/01/26 est un jour sobriete
    assert.strictEqual(flex.getDayType({ date: '2026/01/26' }, at(5)), 'sobriete');
    assert.strictEqual(flex.getDayType({ date: '2026/01/27' }, at(5)), 'bleu', 'pas de report de la veille');
    assert.strictEqual(flex.getDayType({ date: '2026/01/26' }, at(12)), 'sobriete');
});

test('Zen Estival : saisons aux frontières de mois (hiver = novembre à mars)', () => {
    const estival = byName('EDF - Zen Estival');

    // 9h : hors plages super creuses des deux saisons
    assert.strictEqual(estival.getDayType({ date: '2024/10/31' }, at(9)), 'ete');
    assert.strictEqual(estival.getDayType({ date: '2024/11/01' }, at(9)), 'hiver');
    assert.strictEqual(estival.getDayType({ date: '2025/03/31' }, at(9)), 'hiver');
    assert.strictEqual(estival.getDayType({ date: '2025/04/01' }, at(9)), 'ete');
});

test('Zen Estival : règle 6h sur la saison, sous-types super creuses selon l\'heure', () => {
    const estival = byName('EDF - Zen Estival');

    // avant 6h le 1er novembre : la veille est en octobre -> été (heure 3 hors 11h-18h -> pas SC)
    assert.strictEqual(estival.getDayType({ date: '2024/11/01' }, at(3)), 'ete');

    // Super creuses été 11h-18h : le relevé étiqueté T couvre ]T-pas ; T],
    // la fenêtre couvre donc les relevés ]11h ; 18h] (même convention que HP/HC).
    assert.strictEqual(estival.getDayType({ date: '2024/07/15' }, at(10)), 'ete');
    assert.strictEqual(estival.getDayType({ date: '2024/07/15' }, at(11)), 'ete', 'le relevé 11:00 couvre 10:30-11:00, avant la fenêtre SC');
    assert.strictEqual(estival.getDayType({ date: '2024/07/15' }, at(11, 30)), 'eteSC');
    assert.strictEqual(estival.getDayType({ date: '2024/07/15' }, at(17)), 'eteSC');
    assert.strictEqual(estival.getDayType({ date: '2024/07/15' }, at(18)), 'eteSC', 'le relevé 18:00 couvre 17:30-18:00, dans la fenêtre SC');
    assert.strictEqual(estival.getDayType({ date: '2024/07/15' }, at(18, 30)), 'ete');

    // super creuses hiver : 22h-24h et 0h-7h
    assert.strictEqual(estival.getDayType({ date: '2024/12/15' }, at(21)), 'hiver');
    assert.strictEqual(estival.getDayType({ date: '2024/12/15' }, at(22)), 'hiver', 'le relevé 22:00 couvre 21:30-22:00, avant la fenêtre SC');
    assert.strictEqual(estival.getDayType({ date: '2024/12/15' }, at(22, 30)), 'hiverSC');
    assert.strictEqual(estival.getDayType({ date: '2024/12/15' }, at(2)), 'hiverSC');
    assert.strictEqual(estival.getDayType({ date: '2024/12/15' }, at(6, 30)), 'hiverSC');
    assert.strictEqual(estival.getDayType({ date: '2024/12/15' }, at(7)), 'hiverSC', 'le relevé 7:00 couvre 6:30-7:00, dans la fenêtre SC');
    // minuit : heure 24 (relevé 23:30-24:00 rattaché à la veille), dans la fenêtre 22h-24h
    assert.strictEqual(estival.getDayType({ date: '2024/12/15' }, at(24)), 'hiverSC');
});
