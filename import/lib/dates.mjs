// Dates françaises des grilles ("applicable au 1er juillet 2026") -> "AAAA-MM-JJ".
const MONTHS = {
    'janvier': 1, 'janv': 1, 'février': 2, 'fevrier': 2, 'févr': 2, 'fevr': 2,
    'mars': 3, 'avril': 4, 'avr': 4, 'mai': 5, 'juin': 6, 'juillet': 7, 'juil': 7,
    'août': 8, 'aout': 8, 'septembre': 9, 'sept': 9, 'octobre': 10, 'oct': 10,
    'novembre': 11, 'nov': 11, 'décembre': 12, 'decembre': 12, 'déc': 12, 'dec': 12,
};

// Les PDF EDF éclatent parfois les mots eux-mêmes ("ma r s") : chaque mois
// est décrit lettre à lettre avec espaces optionnels entre les lettres.
// Les formes longues sont testées avant les abréviations ("juillet" avant
// "juil"), et l'abréviation peut être suivie d'un point.
const MONTH_PATTERN = Object.keys(MONTHS)
    .sort((a, b) => b.length - a.length)
    .map(m => m.split('').join('\\s*'))
    .join('|');

const DATE_RE = new RegExp(
    String.raw`(\d{1,2})\s*(?:er)?\s+(${MONTH_PATTERN})\.?\s+(\d{4})`,
    'iu'
);

// Cherche la première date française dans un texte libre. -> "AAAA-MM-JJ" | null
// Les PDF EDF éclatent parfois les chiffres ("202 6") : on recolle les
// groupes de chiffres séparés par des espaces avant de chercher.
export function findFrDate(text) {
    const normalized = text.replace(/\t/g, ' ').replace(/(\d)\s+(?=\d)/g, '$1');
    const m = normalized.match(DATE_RE);
    if (!m) return null;
    const day = String(m[1]).padStart(2, '0');
    const month = String(MONTHS[m[2].toLowerCase().replace(/\s+/g, '')]).padStart(2, '0');
    return `${m[3]}-${month}-${day}`;
}

// Date numérique "12/06/2026" ou "01 / 0 2 /202 6" (chiffres éclatés).
const NUMERIC_DATE_RE = /(\d{1,2})\s*\/\s*(\d{1,2})\s*\/\s*(\d{4})/;

export function findNumericDate(text) {
    const normalized = text.replace(/\t/g, ' ').replace(/(\d)\s+(?=\d)/g, '$1');
    const m = normalized.match(NUMERIC_DATE_RE);
    if (!m) return null;
    return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
}

// Date de la ligne "Applicable au ..." (grilles EDF) : plus fiable que la
// première date du document. lines = sortie de buildLines.
export function findApplicableDate(lines) {
    for (const line of lines) {
        if (/applicable/i.test(line.text)) {
            const date = findFrDate(line.text);
            if (date) return date;
        }
    }
    return null;
}
