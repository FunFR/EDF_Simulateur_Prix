import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseFrNumber, euroPerKwhToCents, round2 } from '../lib/fr-numbers.mjs';

test('parseFrNumber : formats français courants', () => {
    assert.equal(parseFrNumber('19,27'), 19.27);
    assert.equal(parseFrNumber('0,1927'), 0.1927);
    assert.equal(parseFrNumber('15,65 €'), 15.65);
    assert.equal(parseFrNumber('1 234,56'), 1234.56);
    assert.equal(parseFrNumber('1 234,56 €'), 1234.56);
    assert.equal(parseFrNumber('19.27'), 19.27);
    assert.equal(parseFrNumber('12'), 12);
});

test('parseFrNumber : rejets', () => {
    assert.equal(parseFrNumber('6 kVA'), null);
    assert.equal(parseFrNumber('abo'), null);
    assert.equal(parseFrNumber(''), null);
    assert.equal(parseFrNumber('12,34,56'), null);
});

test('euroPerKwhToCents : pas de dérive flottante', () => {
    assert.equal(euroPerKwhToCents(0.1927), 19.27);
    assert.equal(euroPerKwhToCents(0.2516), 25.16);
    assert.equal(euroPerKwhToCents(0.1), 10);
});

test('round2', () => {
    assert.equal(round2(15.649999999), 15.65);
    assert.equal(round2(12), 12);
});
