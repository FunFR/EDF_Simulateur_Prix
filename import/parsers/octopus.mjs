// Grilles Octopus Energy : un tableau par page (kVA 1 à 36), prix kWh en
// cellules fusionnées. Eco-conso fixe : base page 2, HP/HC page 3, chacun
// en HTT/TTC. OctoTempo : page 2 = prix HTT, page 3 = prix TTC (celle que
// le repo modélise), 6 cadrans hiver/été/jours rouges.
import path from 'node:path';
import { findKvaTables, extractConfiguredOffers } from '../lib/table.mjs';
import { findNumericDate } from '../lib/dates.mjs';
import { pageToText } from '../lib/pdf-text.mjs';

export const provider = 'octopus';

const T = (offer, colCount, abo, prices) => ({ offer, colCount, abo, prices });

// pages : indices (0-based) des pages contenant les tableaux à extraire,
// dans l'ordre des configs.
const CONFIGS = {
    'grille-tarifaire-eco_conso_fixe_2_b_mars26.pdf': {
        pages: [1, 2],
        tables: [
            T('Octopus - Base', 4, 1, [[3, ['bleu.price']]]),
            T('Octopus - Heures Creuses', 6, 1, [[3, ['bleu.HP']], [5, ['bleu.HC']]]),
        ],
    },
    'grille-tarifaire-octotempo.pdf': {
        pages: [2],
        tables: [
            T('Octopus - OctoTempo', 7, 0, [
                [1, ['hiver.HP']], [2, ['hiver.HC']],
                [3, ['ete.HP']], [4, ['ete.HC']],
                [5, ['rouge.HP']], [6, ['rouge.HC']],
            ]),
        ],
    },
};

export function parse(doc, url) {
    const basename = path.basename(new URL(url).pathname);
    const config = CONFIGS[basename];
    if (!config) throw new Error(`PDF Octopus non configuré : ${basename}`);

    const subDoc = { pages: config.pages.map(i => doc.pages[i]) };
    const tables = findKvaTables(subDoc);
    const offers = extractConfiguredOffers(subDoc, tables, config.tables, basename);
    return { gridDate: findNumericDate(pageToText(doc.pages[0])), offers };
}
