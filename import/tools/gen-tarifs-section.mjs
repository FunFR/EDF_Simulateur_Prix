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
    labelleenergie: 'La Bellenergie',
    mint: 'Mint Énergie',
    sobry: 'Sobry',
    total: 'TotalEnergies',
};

const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

const BEGIN = '<!-- TARIFS-LIST:BEGIN -->';
const END = '<!-- TARIFS-LIST:END -->';
const INDENT = '                    '; // profondeur des enfants de <section> > .shell
const GROUP = INDENT + '        '; // <div class="tarifs-group"> (sous .tarifs-groups)
const GROUP_BODY = GROUP + '    '; // h3, note, .tarifs-grid
const OFFER = GROUP_BODY + '    '; // <div class="tarifs-offer">

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

// Carte d'offre : nom en gras, type + date de grille en méta grise, lien à droite.
function renderOffer(def, provider) {
    const label = escapeHtml(offerLabel(def, provider));
    const type = def.offer_type === 'TRV' ? 'Tarif réglementé' : 'Offre de marché';
    const grille = `grille du ${formatDate(def.lastUpdate)}`;
    const lines = [
        `${OFFER}<div class="tarifs-offer">`,
        `${OFFER}    <span class="tarifs-offer-name"><strong>${label}</strong>`,
        `${OFFER}        <span class="tarifs-offer-meta">${type} — ${grille}</span></span>`,
    ];
    if (def.subscription_url) {
        lines.push(`${OFFER}    <a href="${escapeHtml(def.subscription_url)}" target="_blank" rel="noopener">page de l’offre</a>`);
    }
    lines.push(`${OFFER}</div>`);
    return lines;
}

// Groupe (un fournisseur officiel ou le bloc communautaire) : h3 sous le h2 de
// la section, encart d'avertissement optionnel, puis grille de cartes.
function renderGroup(title, defs, provider, note) {
    const lines = [
        `${GROUP}<div class="tarifs-group">`,
        `${GROUP_BODY}<h3>${escapeHtml(title)}</h3>`,
    ];
    if (note) lines.push(`${GROUP_BODY}<p class="tarifs-note">${note}</p>`);
    lines.push(`${GROUP_BODY}<div class="tarifs-grid">`);
    for (const def of [...defs].sort((a, b) => a.name.localeCompare(b.name, 'fr'))) {
        lines.push(...renderOffer(def, provider));
    }
    lines.push(`${GROUP_BODY}</div>`);
    lines.push(`${GROUP}</div>`);
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
    lines.push(`${INDENT}<p class="tarifs-intro"><strong>${defs.length} offres de ${nbProviders} fournisseurs</strong>`
        + ` sont actuellement suivies. Les grilles tarifaires sont actualisées au fil de l’eau à partir`
        + ` des documents officiels des fournisseurs (dernière mise à jour d’une grille : ${formatDate(lastUpdate)}).</p>`);
    // Détail replié derrière un collapse Bootstrap (bouton et chevron stylés par
    // .tarifs-toggle dans style.css) ; le bundle Bootstrap est déjà chargé.
    lines.push(`${INDENT}<button class="tarifs-toggle collapsed" type="button" data-bs-toggle="collapse"`);
    lines.push(`${INDENT}    data-bs-target="#tarifsDetail" aria-expanded="false" aria-controls="tarifsDetail">`);
    lines.push(`${INDENT}    <span>Voir le détail des offres suivies</span>`);
    lines.push(`${INDENT}    <span class="tarifs-toggle-chevron" aria-hidden="true">▼</span>`);
    lines.push(`${INDENT}</button>`);
    lines.push(`${INDENT}<div id="tarifsDetail" class="collapse">`);
    lines.push(`${INDENT}    <div class="tarifs-groups">`);
    for (const provider of providers) {
        lines.push(...renderGroup(provider, byProvider.get(provider), provider, null));
    }
    if (community.length) {
        lines.push(...renderGroup('Tarifs communautaires', community, null,
            'Ces tarifs sont maintenus par la communauté et peuvent ne pas être à jour :'
            + ' vérifiez-les sur le site du fournisseur avant toute décision.'));
    }
    lines.push(`${INDENT}    </div>`);
    lines.push(`${INDENT}</div>`);
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

    // Respecte les fins de ligne du fichier (CRLF sous Windows) : sinon la
    // section régénérée en LF diffère dès que l'éditeur renormalise le fichier,
    // et --check casse sans changement réel.
    const eol = html.includes('\r\n') ? '\r\n' : '\n';
    const generated = `\n${generate()}\n${INDENT}`.replaceAll('\n', eol);
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
