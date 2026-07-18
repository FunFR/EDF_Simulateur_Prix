// Lecture et parsing du CSV réel d'échantillon (export EDF "puissances atteintes").
// Le fichier est encodé en Latin-1/Windows-1252 : ne jamais le lire en utf8.
import fs from 'node:fs';
import { edfParser } from '../../scripts/parsers/edfParser.js';

const CSV_URL = new URL('../../Sample/mes-puissances-atteintes-30min-000000000000-00000.csv', import.meta.url);

let cache = null;

export function loadSampleData() {
    if (!cache) {
        const text = fs.readFileSync(CSV_URL, 'latin1');
        cache = edfParser.loadData(edfParser.parseCSV(text));
    }
    // Clone : le calculateur et les tests ne doivent pas pouvoir polluer le cache.
    return structuredClone(cache);
}

export function loadSampleText() {
    return fs.readFileSync(CSV_URL, 'latin1');
}
