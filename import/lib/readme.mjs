// Met à jour la section « Derniers tarifs » du README racine pour les
// fournisseurs dont des grilles ont été appliquées.
import fs from 'node:fs';
import path from 'node:path';
import { REPO_ROOT } from './tarif-defs.mjs';

const README_LABELS = {
    edf: 'EDF',
    total: 'TotalEnergie',
    mint: 'Mint Energie',
    octopus: 'Octopus',
    alpiq: 'Alpiq',
    labelleenergie: 'La belle énergie',
    engie: 'Engie',
    alterna: 'Alterna',
    enercoop: 'Enercoop',
    gazdebordeaux: 'Gaz de Bordeaux',
};

// datesByProvider : Map<provider, "AAAA-MM-JJ"> (date de grille appliquée).
// -> liste des fournisseurs effectivement mis à jour dans le README.
export function updateReadmeDates(datesByProvider) {
    const readmePath = path.join(REPO_ROOT, 'README.md');
    let content = fs.readFileSync(readmePath, 'utf8');
    const updated = [];
    for (const [provider, date] of datesByProvider) {
        const label = README_LABELS[provider];
        if (!label) continue;
        const re = new RegExp(`^(\\* ${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*:\\s*).*$`, 'm');
        if (re.test(content)) {
            content = content.replace(re, `$1${date}`);
            updated.push(provider);
        }
    }
    if (updated.length > 0) fs.writeFileSync(readmePath, content);
    return updated;
}
