// Mini barre 100 % empilée de la répartition de la consommation par tranche
// (sous chaque ligne de tarif du tableau de résultats). Même facture que
// dayChart : SVG construit à la main, tooltip natif <title> par segment,
// légende de pastilles avec pourcentages visibles.
import { cloneTemplate } from './dom.js';

const SVG_NS = "http://www.w3.org/2000/svg";

const WIDTH = 480;
const HEIGHT = 12;
const GAP = 1.5;

// Liseré fin pour garder lisibles les segments pâles (jour Blanc).
const EDGE_COLOR = "#C3C9D4";

// Géométrie des segments (fonction pure, testée sous node) : largeurs
// proportionnelles aux conso brutes — pas aux pourcentages arrondis — avec un
// petit écart entre segments et une largeur minimale pour rester visible.
export function buildShareGeometry(share, width = WIDTH) {
    let x = 0;
    return share.segments.map((segment, index) => {
        const exact = (segment.conso / share.total) * width;
        const gap = index === share.segments.length - 1 ? 0 : GAP;
        const item = { x: x, w: Math.max(1, exact - gap), segment: segment };
        x += exact;
        return item;
    });
}

function pctText(segment) {
    return segment.pct === 0 ? "< 1 %" : segment.pct + " %";
}

// Élément complet : barre + légende, depuis le résultat de buildPeriodShare.
export function renderBandShareBar(share) {
    const { fragment, refs } = cloneTemplate("tpl-band-share");

    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", "0 0 " + WIDTH + " " + HEIGHT);
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "Répartition de la consommation : "
        + share.segments.map(s => s.label + " " + pctText(s)).join(", "));

    for (const item of buildShareGeometry(share)) {
        const rect = document.createElementNS(SVG_NS, "rect");
        rect.setAttribute("x", item.x.toFixed(2));
        rect.setAttribute("y", "0");
        rect.setAttribute("width", item.w.toFixed(2));
        rect.setAttribute("height", String(HEIGHT));
        rect.setAttribute("fill", item.segment.color);
        rect.setAttribute("stroke", EDGE_COLOR);
        rect.setAttribute("stroke-width", "0.5");

        const title = document.createElementNS(SVG_NS, "title");
        title.textContent = item.segment.longLabel + " — "
            + (item.segment.conso / 1000).toFixed(2) + " kWh — " + pctText(item.segment);
        rect.appendChild(title);
        svg.appendChild(rect);
    }
    refs["bar"].appendChild(svg);

    // Deux chips par ligne : les paires suivent les familles jour × HP/HC
    // (Bleu HP/HC, Blanc HP/HC...) et la légende reste compacte.
    for (let i = 0; i < share.segments.length; i += 2) {
        const line = document.createElement("div");
        for (const segment of share.segments.slice(i, i + 2)) {
            const chip = document.createElement("span");
            chip.className = "me-2 text-nowrap";
            const dot = document.createElement("span");
            dot.className = "band-dot";
            dot.style.backgroundColor = segment.color;
            chip.appendChild(dot);
            chip.appendChild(document.createTextNode(segment.label + " " + pctText(segment)));
            line.appendChild(chip);
        }
        refs["legend"].appendChild(line);
    }

    return fragment;
}
