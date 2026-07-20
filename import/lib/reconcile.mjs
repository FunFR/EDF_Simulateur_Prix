// Compare une définition defineTarif du repo aux valeurs extraites du PDF
// et produit la liste des remplacements à appliquer (chemin, ancienne
// valeur, nouvelle valeur). Toute divergence STRUCTURELLE (kVA ou type de
// jour présent d'un côté seulement) est remontée comme problème à traiter
// manuellement : on ne patche jamais la structure, uniquement des nombres.

function keysDiff(a, b) {
    const ka = Object.keys(a).sort();
    const kb = Object.keys(b).sort();
    if (ka.join(',') === kb.join(',')) return null;
    const missing = kb.filter(k => !ka.includes(k));
    const extra = ka.filter(k => !kb.includes(k));
    return { missing, extra };
}

function describeKeysDiff(what, diff) {
    const parts = [];
    if (diff.missing.length) parts.push(`${what} dans le PDF mais pas dans le repo : ${diff.missing.join(', ')}`);
    if (diff.extra.length) parts.push(`${what} dans le repo mais pas dans le PDF : ${diff.extra.join(', ')}`);
    return parts.join(' ; ');
}

// Tolérance : certaines valeurs du repo sont des quotients à décimales
// périodiques (abonnement Engie = €/an ÷ 12) dont l'écriture littérale est
// tronquée — un écart < 1e-9 n'est pas un changement.
const EPSILON = 1e-9;

function compareLeaf(changes, path, oldValue, newValue) {
    if (typeof newValue !== 'number' || !Number.isFinite(newValue)) {
        throw new Error(`valeur extraite non numérique pour ${path.join('.')} : ${newValue}`);
    }
    if (Math.abs(oldValue - newValue) > EPSILON) changes.push({ path, old: oldValue, new: newValue });
}

// spec = { price } ou { HP, HC } — même contrat côté repo et côté parser.
function compareDayTypeSpec(changes, issues, basePath, oldSpec, newSpec) {
    const diff = keysDiff(oldSpec, newSpec);
    if (diff) {
        issues.push(`${basePath.join('.')} : ${describeKeysDiff('composantes', diff)}`);
        return;
    }
    for (const key of Object.keys(oldSpec)) {
        compareLeaf(changes, [...basePath, key], oldSpec[key], newSpec[key]);
    }
}

// -> { changes: [{path, old, new}], issues: [string] }
// Le repo peut ne modéliser qu'un sous-ensemble des puissances du PDF
// (TotalEnergies liste tous les kVA de 3 à 36) : les puissances
// excédentaires du PDF sont ignorées ; une puissance du repo absente du
// PDF est en revanche un problème structurel.
export function reconcileOffer(def, offer, lastUpdate) {
    const changes = [];
    const issues = [];

    const missingKvas = Object.keys(def.subscriptions).filter(k => !(k in offer.subscriptions));
    if (missingKvas.length) {
        issues.push(`subscriptions : puissances dans le repo mais pas dans le PDF : ${missingKvas.join(', ')}`);
    } else {
        for (const kva of Object.keys(def.subscriptions)) {
            compareLeaf(changes, ['subscriptions', kva], def.subscriptions[kva], offer.subscriptions[kva]);
        }
    }

    // dayTypes est absent des tarifs spot (le kWh vient de spotFormula).
    if (!!def.dayTypes !== !!offer.dayTypes) {
        issues.push(def.dayTypes
            ? 'dayTypes présents dans le repo mais pas dans le PDF'
            : 'dayTypes présents dans le PDF mais pas dans le repo');
    } else if (def.dayTypes) {
        const dtDiff = keysDiff(def.dayTypes, offer.dayTypes);
        if (dtDiff) {
            issues.push(`dayTypes : ${describeKeysDiff('types de jour', dtDiff)}`);
        } else {
            for (const type of Object.keys(def.dayTypes)) {
                compareDayTypeSpec(changes, issues, ['dayTypes', type], def.dayTypes[type], offer.dayTypes[type]);
            }
        }
    }

    const defOverrides = def.priceOverrides || null;
    // Les overrides du parser sont restreints aux puissances modélisées
    // par le repo (mêmes raisons que ci-dessus).
    let offerOverrides = null;
    if (offer.priceOverrides) {
        const kept = Object.entries(offer.priceOverrides)
            .filter(([kva]) => kva in def.subscriptions);
        if (kept.length > 0) offerOverrides = Object.fromEntries(kept);
    }
    if (!!defOverrides !== !!offerOverrides) {
        issues.push(defOverrides
            ? 'priceOverrides présents dans le repo mais pas dans le PDF'
            : 'priceOverrides présents dans le PDF mais pas dans le repo');
    } else if (defOverrides) {
        const ovDiff = keysDiff(defOverrides, offerOverrides);
        if (ovDiff) {
            issues.push(`priceOverrides : ${describeKeysDiff('puissances', ovDiff)}`);
        } else {
            for (const kva of Object.keys(defOverrides)) {
                const typeDiff = keysDiff(defOverrides[kva], offerOverrides[kva]);
                if (typeDiff) {
                    issues.push(`priceOverrides.${kva} : ${describeKeysDiff('types de jour', typeDiff)}`);
                    continue;
                }
                for (const type of Object.keys(defOverrides[kva])) {
                    compareDayTypeSpec(changes, issues,
                        ['priceOverrides', kva, type], defOverrides[kva][type], offerOverrides[kva][type]);
                }
            }
        }
    }

    // spotFormula (tarifs spot) : composantes scalaires ou saisonnières
    // { hiver, ete } — deux niveaux au plus, comparaison feuille à feuille.
    const defFormula = def.spotFormula || null;
    const offerFormula = offer.spotFormula || null;
    if (!!defFormula !== !!offerFormula) {
        issues.push(defFormula
            ? 'spotFormula présent dans le repo mais pas dans le PDF'
            : 'spotFormula présent dans le PDF mais pas dans le repo');
    } else if (defFormula) {
        const sfDiff = keysDiff(defFormula, offerFormula);
        if (sfDiff) {
            issues.push(`spotFormula : ${describeKeysDiff('composantes', sfDiff)}`);
        } else {
            for (const key of Object.keys(defFormula)) {
                const oldValue = defFormula[key];
                const newValue = offerFormula[key];
                if (oldValue !== null && typeof oldValue === 'object') {
                    if (newValue === null || typeof newValue !== 'object') {
                        issues.push(`spotFormula.${key} : objet attendu des deux côtés`);
                        continue;
                    }
                    const seasonDiff = keysDiff(oldValue, newValue);
                    if (seasonDiff) {
                        issues.push(`spotFormula.${key} : ${describeKeysDiff('saisons', seasonDiff)}`);
                        continue;
                    }
                    for (const season of Object.keys(oldValue)) {
                        compareLeaf(changes, ['spotFormula', key, season], oldValue[season], newValue[season]);
                    }
                } else {
                    compareLeaf(changes, ['spotFormula', key], oldValue, newValue);
                }
            }
        }
    }

    // lastUpdate ne bouge que si au moins un prix change réellement.
    if (changes.length > 0 && def.lastUpdate !== lastUpdate) {
        changes.push({ path: ['lastUpdate'], old: def.lastUpdate, new: lastUpdate });
    }
    return { changes, issues };
}
