// Tests de la géométrie de la barre de répartition (scripts/ui/bandShareBar.js).
// renderBandShareBar nécessite un DOM ; buildShareGeometry est pure et testée ici.
import { test } from 'node:test';
import assert from 'node:assert';
import { buildShareGeometry } from '../../scripts/ui/bandShareBar.js';

const segment = (conso, pct) => ({ key: 'k', label: 'L', longLabel: 'LL', color: '#000000', conso: conso, pct: pct });

test('buildShareGeometry : largeurs proportionnelles aux conso, x cumulés', () => {
    const share = { total: 1000, segments: [segment(600, 60), segment(400, 40)] };
    const geo = buildShareGeometry(share, 100);

    assert.strictEqual(geo.length, 2);
    assert.strictEqual(geo[0].x, 0);
    assert.strictEqual(geo[0].w, 60 - 1.5, 'écart retiré entre segments');
    assert.strictEqual(geo[1].x, 60, 'x cumulé sur les largeurs exactes');
    assert.strictEqual(geo[1].w, 40, 'dernier segment sans écart');
    assert.strictEqual(geo[1].x + geo[1].w, 100, 'la barre remplit toute la largeur');
    assert.strictEqual(geo[0].segment, share.segments[0]);
});

test('buildShareGeometry : largeur minimale pour un segment minuscule', () => {
    const share = { total: 10000, segments: [segment(9995, 100), segment(5, 0)] };
    const geo = buildShareGeometry(share, 480);

    assert.strictEqual(geo[1].w, 1, 'segment de 0,05 % visible malgré tout');
    assert.ok(geo[0].w > 470);
});
