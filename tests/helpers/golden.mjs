// Comparaison golden-master : chaque snapshot est un fichier JSON versionné
// dans tests/golden/. Régénération : UPDATE_GOLDEN=1 node --test "tests/**/*.test.mjs"
import fs from 'node:fs';
import assert from 'node:assert';

const GOLDEN_DIR = new URL('../golden/', import.meta.url);
const UPDATE = process.env.UPDATE_GOLDEN === '1';

// NaN est encodé en chaîne : JSON.stringify(NaN) produirait null et masquerait
// une régression sur les jours/mois incomplets.
export const roundEuro = x => Number.isNaN(x) ? 'NaN' : Number(x.toFixed(8));
export const roundWh = x => Number.isNaN(x) ? 'NaN' : Number(x.toFixed(3));

export function checkGolden(name, actual) {
    const fileURL = new URL(`${name}.json`, GOLDEN_DIR);
    // Round-trip JSON : normalise -0, undefined, ordre d'insertion des clés.
    const normalized = JSON.parse(JSON.stringify(actual));

    if (UPDATE) {
        fs.mkdirSync(GOLDEN_DIR, { recursive: true });
        fs.writeFileSync(fileURL, JSON.stringify(normalized, null, 2) + '\n');
        return;
    }

    if (!fs.existsSync(fileURL)) {
        assert.fail(`Golden manquant : tests/golden/${name}.json — générer avec UPDATE_GOLDEN=1 node --test "tests/**/*.test.mjs"`);
    }

    const expected = JSON.parse(fs.readFileSync(fileURL, 'utf8'));
    assert.deepStrictEqual(normalized, expected,
        `Écart avec tests/golden/${name}.json — si le changement est voulu, régénérer avec UPDATE_GOLDEN=1`);
}
