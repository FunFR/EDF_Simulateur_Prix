import { edfParser } from './edfParser.js';
import { enedisParser } from './enedisParser.js';
import { enedisBokupParser } from './enedisBokupParser.js';
import { totalParser } from './totalParser.js';
import { serParser } from './serParser.js';
import { homeAssistantParser } from './homeAssistantParser.js';
import { enedisCourbeParser } from './enedisCourbeParser.js';

// Choisit le parser adapté au fichier importé d'après son nom.
export function selectParser(fileName) {
    const regexTotalEnergies = /^\d+-.+-.+\.csv$/;
    if (fileName.includes("conso-courbe-30min")) {
        return enedisCourbeParser;
    } else if (fileName.includes("historique_conso")) {
        return enedisBokupParser;
    } else if (fileName.includes("Enedis")) {
        return enedisParser;
    } else if (fileName.match(regexTotalEnergies)) {
        return totalParser;
    } else if (fileName.includes("export_courbe_charges")) {
        return serParser;
    } else if (fileName.includes("history")) {
        return homeAssistantParser;
    }
    return edfParser;
}
