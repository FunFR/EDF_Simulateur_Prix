// Parsing des nombres au format français des grilles tarifaires
// ("19,27", "1 234,56 €", "0,1927") et conversions d'unités.

// Accepte virgule ou point décimal, espaces (fine, insécable) comme
// séparateurs de milliers, symbole € ou "c€" éventuel. -> number | null
export function parseFrNumber(raw) {
    if (typeof raw === 'number') return raw;
    if (typeof raw !== 'string') return null;
    const cleaned = raw
        .replace(/[  \s]/g, '')
        .replace(/(c?€|euros?|cts?)\/?(kwh|mois|an)?$/i, '')
        .replace(',', '.');
    if (!/^-?\d+(\.\d+)?$/.test(cleaned)) return null;
    return Number(cleaned);
}

// €/kWh -> centimes/kWh sans dérive flottante (0.1927 -> 19.27).
// Certaines grilles (Alpiq) affichent 6 décimales en € : on conserve
// jusqu'à 4 décimales en centimes (0.175145 -> 17.5145).
export function euroPerKwhToCents(value) {
    return Math.round(value * 1e6) / 1e4;
}

// Arrondi monétaire à 2 décimales (sommes en €).
export function round2(value) {
    return Math.round(value * 100) / 100;
}

// Extrait tous les nombres d'une liste de cellules ("6 kVA", "15,65 €", ...)
// -> [{ cell, index, value }]
export function numbersInCells(cells) {
    const out = [];
    cells.forEach((cell, index) => {
        const value = parseFrNumber(cell);
        if (value !== null) out.push({ cell, index, value });
    });
    return out;
}
