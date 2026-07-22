// Tests de la géométrie de la barre de répartition (scripts/ui/bandShareBar.js).
// renderBandShareBar nécessite un DOM ; buildShareGeometry est pure et testée ici.
import { test } from 'node:test';
import assert from 'node:assert';
import { buildShareGeometry } from '../../scripts/ui/bandShareBar.js';

const segment = (conso, pct, price = 0, pricePct = null) =>
    ({ key: 'k', label: 'L', longLabel: 'LL', color: '#000000', conso: conso, pct: pct, price: price, pricePct: pricePct });

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

test('buildShareGeometry : mode price dimensionné sur les coûts', () => {
    // Conso 60/40 mais coûts 10/90 : les largeurs suivent le mode demandé.
    const share = {
        total: 1000, totalPrice: 1,
        segments: [segment(600, 60, 0.1, 10), segment(400, 40, 0.9, 90)]
    };

    const geoPrice = buildShareGeometry(share, 100, 'price');
    assert.strictEqual(geoPrice[0].w, 10 - 1.5);
    assert.strictEqual(geoPrice[1].x, 10);
    assert.strictEqual(geoPrice[1].w, 90);
    assert.strictEqual(geoPrice[1].x + geoPrice[1].w, 100, 'la barre remplit toute la largeur');

    const geoDefault = buildShareGeometry(share, 100);
    assert.strictEqual(geoDefault[0].w, 60 - 1.5, 'sans mode : conso, comportement inchangé');

    // Coût minuscule : même largeur minimale qu'en mode conso.
    const tiny = {
        total: 1000, totalPrice: 10,
        segments: [segment(500, 50, 9.995, 100), segment(500, 50, 0.005, 0)]
    };
    assert.strictEqual(buildShareGeometry(tiny, 480, 'price')[1].w, 1);
});
