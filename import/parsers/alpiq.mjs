// Grille Alpiq (gtr_elec_part.pdf) : page 1 = offre Électricité Stable,
// deux tableaux côte à côte (Base / Heures Creuses). Toutes les puissances
// entières, abonnement HT/TTC par ligne, prix kWh en cellules fusionnées
// avec double série TRV/Alpiq (6 décimales en €/kWh). Le repo stocke les
// TTC Alpiq.
import { findKvaTables, extractConfiguredOffers } from '../lib/table.mjs';
import { findNumericDate } from '../lib/dates.mjs';
import { pageToText } from '../lib/pdf-text.mjs';

export const provider = 'alpiq';

const CONFIGS = [
    // abo HT/TTC + [TRV HT, TRV TTC, Alpiq HT, Alpiq TTC]
    { offer: 'Alpiq - Base', colCount: 6, abo: 1, prices: [[5, ['bleu.HP', 'bleu.HC']]] },
    // abo HT/TTC + HP [TRV HT, TRV TTC, Alpiq HT, Alpiq TTC] + HC [idem]
    { offer: 'Alpiq - Heures Creuses', colCount: 10, abo: 1, prices: [[5, ['bleu.HP']], [9, ['bleu.HC']]] },
];

export function parse(doc) {
    // Page 1 = électricité Stable ; pages suivantes = autres offres/gaz.
    const tables = findKvaTables({ pages: [doc.pages[0]] });
    // PDF très dense : certaines colonnes ne sont espacées que de ~2.7 pts,
    // et chaque nombre y est un item entier (pas de chiffres fragmentés) —
    // on peut donc couper les cellules au moindre écart.
    const offers = extractConfiguredOffers(doc, tables, CONFIGS, 'gtr_elec_part.pdf', { cellGap: 1 });
    return { gridDate: findNumericDate(pageToText(doc.pages[0])), offers };
}
