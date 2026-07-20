// Grilles Mint Energie : page 1, deux tableaux côte à côte (Base / HP-HC),
// abonnement HTT/TTC par ligne et prix kWh en cellules fusionnées HTT/TTC.
// Le repo stocke les TTC.
import path from 'node:path';
import { findKvaTables, extractConfiguredOffers } from '../lib/table.mjs';
import { findNumericDate } from '../lib/dates.mjs';
import { pageToText } from '../lib/pdf-text.mjs';

export const provider = 'mint';

const T = (offer, colCount, abo, prices) => ({ offer, colCount, abo, prices });

const CONFIGS = {
    'MINT_ENERGIE_Fiche_Tarifs_23012_CLASSIC_GREEN.pdf': [
        T('Mint Energie - Classic & Green', 4, 1, [[3, ['bleu.price']]]),
        T('Mint Energie - Classic & Green HC', 6, 1, [[3, ['bleu.HP']], [5, ['bleu.HC']]]),
    ],
    'MINT_ENERGIE_Fiche_Tarifs_21912_ONLINE_GREEN.pdf': [
        T('Mint Energie - Online & Green', 4, 1, [[3, ['bleu.price']]]),
        T('Mint Energie - Online & Green HC', 6, 1, [[3, ['bleu.HP']], [5, ['bleu.HC']]]),
    ],
};

export function parse(doc, url) {
    const basename = path.basename(new URL(url).pathname);
    const configs = CONFIGS[basename];
    if (!configs) throw new Error(`PDF Mint non configuré : ${basename}`);

    // Page 1 = grille ; pages suivantes = fiche descriptive.
    const tables = findKvaTables({ pages: [doc.pages[0]] });
    const offers = extractConfiguredOffers(doc, tables, configs, basename);
    return { gridDate: findNumericDate(pageToText(doc.pages[0])), offers };
}
