// Génère la section statique « Tarifs actuellement suivis » d'index.html à
// partir des métadonnées defineTarif (name, offer_type, lastUpdate,
// subscription_url, isCommunity). Aucun prix calculé : uniquement des
// métadonnées, la sortie est donc stable tant que les tarifs ne changent pas.
//
// Usage :
//   node import/tools/gen-tarifs-section.mjs           # réécrit index.html
//   node import/tools/gen-tarifs-section.mjs --check   # exit 1 si différent
//
// La section est réécrite strictement entre les marqueurs
// <!-- TARIFS-LIST:BEGIN --> et <!-- TARIFS-LIST:END -->.
import fs from 'node:fs';
import path from 'node:path';
import { listTarifDefs, REPO_ROOT } from '../lib/tarif-defs.mjs';

// Dossier de scripts/tarifs/ -> nom commercial affiché. Un dossier absent de
// cette table fait échouer la génération : à compléter à chaque nouveau
// fournisseur.
const PROVIDERS = {
    alpiq: 'Alpiq',
    alterna: 'Alterna',
    edf: 'EDF',
    enercoop: 'Enercoop',
    engie: 'Engie',
    gazdebordeaux: 'Gaz de Bordeaux',
    labelleenergie: 'La Bellenergie',
    mint: 'Mint Énergie',
    octopus: 'Octopus Energy',
    sobry: 'Sobry',
    total: 'TotalEnergies',
};

const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

const BEGIN = '<!-- TARIFS-LIST:BEGIN -->';
const END = '<!-- TARIFS-LIST:END -->';
const INDENT = '                    '; // profondeur des enfants de <section>

function escapeHtml(s) {
    return String(s)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;');
}

// "2026-02-01" -> "1<sup>er</sup> février 2026" (sans sup : "1er")
function formatDate(iso) {
    const [y, m, d] = iso.split('-').map(Number);
    const day = d === 1 ? '1er' : String(d);
    return `${day} ${MOIS[m - 1]} ${y}`;
}

function providerOf(def) {
    const folder = def.file.split('/')[2];
    const name = PROVIDERS[folder];
    if (!name) throw new Error(`Fournisseur inconnu « ${folder} » (${def.file}) : compléter PROVIDERS dans ${path.relative(REPO_ROOT, process.argv[1])}`);
    return name;
}

// "EDF - Tempo" sous le h3 « EDF » -> "Tempo" ; sinon nom complet
// (provider null = liste sans regroupement, on garde le nom complet).
function offerLabel(def, provider) {
    if (!provider) return def.name;
    const prefix = `${provider} - `;
    return def.name.startsWith(prefix) ? def.name.slice(prefix.length) : def.name;
}

function renderOffer(def, provider) {
    const label = escapeHtml(offerLabel(def, provider));
    const badge = def.offer_type === 'TRV'
        ? '<span class="badge text-bg-primary">Tarif réglementé</span>'
        : '<span class="badge text-bg-secondary">Offre de marché</span>';
    const grille = `grille du ${formatDate(def.lastUpdate)}`;
    const link = def.subscription_url
        ? ` — <a href="${escapeHtml(def.subscription_url)}" target="_blank" rel="noopener">page de l’offre</a>`
        : '';
    return `${INDENT}    <li><strong>${label}</strong> ${badge} — ${grille}${link}</li>`;
}

function renderGroup(title, defs) {
    const lines = [`${INDENT}<h3 class="h5 mt-4">${escapeHtml(title)}</h3>`, `${INDENT}<ul>`];
    for (const def of [...defs].sort((a, b) => a.name.localeCompare(b.name, 'fr'))) {
        lines.push(renderOffer(def, title));
    }
    lines.push(`${INDENT}</ul>`);
    return lines;
}

function generate() {
    const defs = listTarifDefs();
    const official = defs.filter(d => d.isCommunity !== true);
    const community = defs.filter(d => d.isCommunity === true);

    const byProvider = new Map();
    for (const def of official) {
        const provider = providerOf(def);
        if (!byProvider.has(provider)) byProvider.set(provider, []);
        byProvider.get(provider).push(def);
    }

    const providers = [...byProvider.keys()].sort((a, b) => a.localeCompare(b, 'fr'));
    const nbProviders = new Set(defs.map(providerOf)).size;
    const lastUpdate = defs.map(d => d.lastUpdate).sort().at(-1);

    const lines = [];
    lines.push(`${INDENT}<p class="text-justify">${defs.length} offres de ${nbProviders} fournisseurs`
        + ` sont actuellement suivies. Les grilles tarifaires sont actualisées au fil de l’eau à partir`
        + ` des documents officiels des fournisseurs (dernière mise à jour d’une grille : ${formatDate(lastUpdate)}).</p>`);
    for (const provider of providers) {
        lines.push(...renderGroup(provider, byProvider.get(provider)));
    }
    if (community.length) {
        lines.push(`${INDENT}<h3 class="h5 mt-4">Tarifs communautaires</h3>`);
        lines.push(`${INDENT}<p class="text-justify">Ces tarifs sont maintenus par la communauté et peuvent ne pas`
            + ` être à jour : vérifiez-les sur le site du fournisseur avant toute décision.</p>`);
        lines.push(`${INDENT}<ul>`);
        for (const def of [...community].sort((a, b) => a.name.localeCompare(b.name, 'fr'))) {
            lines.push(renderOffer(def, null));
        }
        lines.push(`${INDENT}</ul>`);
    }
    return lines.join('\n');
}

function main() {
    const check = process.argv.includes('--check');
    const indexPath = path.join(REPO_ROOT, 'index.html');
    const html = fs.readFileSync(indexPath, 'utf8');

    const begins = html.split(BEGIN).length - 1;
    const ends = html.split(END).length - 1;
    if (begins !== 1 || ends !== 1) {
        throw new Error(`Marqueurs ${BEGIN} / ${END} introuvables ou dupliqués dans index.html (${begins}/${ends}).`);
    }
    const start = html.indexOf(BEGIN) + BEGIN.length;
    const end = html.indexOf(END);
    if (end < start) throw new Error('Marqueur END avant BEGIN dans index.html.');

    const generated = `\n${generate()}\n${INDENT}`;
    const next = html.slice(0, start) + generated + html.slice(end);

    if (next === html) {
        console.log('index.html : section tarifs déjà à jour.');
        return;
    }
    if (check) {
        console.error('index.html : section tarifs obsolète (relancer sans --check).');
        process.exit(1);
    }
    fs.writeFileSync(indexPath, next);
    console.log('index.html : section tarifs régénérée.');
}

main();
