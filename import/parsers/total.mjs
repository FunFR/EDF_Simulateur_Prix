// Grilles TotalEnergies : tableaux « N kVA » (toutes les puissances
// entières) avec colonnes doublées HT/TTC, et pour les offres indexées une
// double série TRV/Offre. Le repo stocke les TTC de l'offre ; on pointe
// donc les colonnes par index (0-based, kVA exclu).
import path from 'node:path';
import { findKvaTables, extractConfiguredOffers } from '../lib/table.mjs';
import { findFrDate } from '../lib/dates.mjs';
import { pageToText } from '../lib/pdf-text.mjs';

export const provider = 'total';

const T = (offer, colCount, abo, prices) => ({ offer, colCount, abo, prices });

const CONFIGS = {
    // Indexée TRV : abo HT/TTC, puis TRV HT/TTC et Offre HT/TTC par cadran.
    'grille-tarifaire-heures-eco-particuliers.pdf': [
        T('TotalEnergie - Heures Eco', 6, 1, [[5, ['bleu.price']]]),
        T('TotalEnergie - HeuresEco HC', 10, 1, [[5, ['bleu.HP']], [9, ['bleu.HC']]]),
    ],
    // Fixes : abo HT/TTC puis Offre HT/TTC par cadran.
    'grille-tarifaire-standard-fixe-particuliers.pdf': [
        T('TotalEnergie - Offre standard fixe', 4, 1, [[3, ['bleu.price']]]),
        T('TotalEnergie - Offre standard fixe HC', 6, 1, [[3, ['bleu.HP']], [5, ['bleu.HC']]]),
    ],
    'grille-tarifaire-verte-fixe-particuliers.pdf': [
        T('TotalEnergie - Offre verte fixe', 4, 1, [[3, ['bleu.price']]]),
        T('TotalEnergie - Offre verte fixe HC', 6, 1, [[3, ['bleu.HP']], [5, ['bleu.HC']]]),
    ],
    'grille-tarifaire-charge-heures-particuliers.pdf': [
        T("TotalEnergie - Charge'Heures", 8, 1, [[3, ['base.HP']], [5, ['base.HC']], [7, ['hsc.price']]]),
    ],
};

export function parse(doc, url) {
    const basename = path.basename(new URL(url).pathname);
    const configs = CONFIGS[basename];
    if (!configs) throw new Error(`PDF TotalEnergies non configuré : ${basename}`);

    // Les pages suivantes concernent le gaz : seule la page 1 (électricité)
    // nous intéresse.
    const tables = findKvaTables({ pages: [doc.pages[0]] });
    const offers = extractConfiguredOffers(doc, tables, configs, basename);
    return { gridDate: findFrDate(pageToText(doc.pages[0])), offers };
}
