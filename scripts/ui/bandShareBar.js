// Mini barre 100 % empilée de la répartition de la consommation par tranche
// (sous chaque ligne de tarif du tableau de résultats). Même facture que
// dayChart : SVG construit à la main, tooltip natif <title> par segment,
// légende de pastilles avec pourcentages visibles.
// Un bouton kWh ⇄ € bascule vers la répartition du coût variable (hors
// abonnement) ; la bascule est synchronisée entre toutes les barres et le
// mode choisi survit aux re-renders (état du module, durée de la session).
import { cloneTemplate } from './dom.js';

const SVG_NS = "http://www.w3.org/2000/svg";

const WIDTH = 480;
const HEIGHT = 12;
const GAP = 1.5;

// Liseré fin pour garder lisibles les segments pâles (jour Blanc).
const EDGE_COLOR = "#C3C9D4";

let currentMode = "conso";
// Barres actuellement rendues, pour la bascule synchronisée. Les barres
// balayées par un re-render (container.innerHTML = "") sont élaguées via
// isConnected au prochain rendu ou à la prochaine bascule.
const instances = [];

function segmentValue(segment, mode) {
    return mode === "price" ? segment.price : segment.conso;
}

// Géométrie des segments (fonction pure, testée sous node) : largeurs
// proportionnelles aux valeurs brutes — pas aux pourcentages arrondis — avec
// un petit écart entre segments et une largeur minimale pour rester visible.
export function buildShareGeometry(share, width = WIDTH, mode = "conso") {
    const total = mode === "price" ? share.totalPrice : share.total;
    let x = 0;
    return share.segments.map((segment, index) => {
        const exact = (segmentValue(segment, mode) / total) * width;
        const gap = index === share.segments.length - 1 ? 0 : GAP;
        const item = { x: x, w: Math.max(1, exact - gap), segment: segment };
        x += exact;
        return item;
    });
}

function pctText(segment, mode) {
    const pct = mode === "price" ? segment.pricePct : segment.pct;
    return pct === 0 ? "< 1 %" : pct + " %";
}

function amountText(segment, mode) {
    return mode === "price"
        ? segment.price.toFixed(2) + " €"
        : (segment.conso / 1000).toFixed(2) + " kWh";
}

// (Re)construit barre + légende + état du bouton pour le mode demandé.
function fillBar(refs, share, mode) {
    refs["bar"].innerHTML = "";
    refs["legend"].innerHTML = "";

    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", "0 0 " + WIDTH + " " + HEIGHT);
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label",
        (mode === "price" ? "Répartition du coût (hors abonnement) : " : "Répartition de la consommation : ")
        + share.segments.map(s => s.label + " " + pctText(s, mode)).join(", "));

    for (const item of buildShareGeometry(share, WIDTH, mode)) {
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
            + amountText(item.segment, mode) + " — " + pctText(item.segment, mode);
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
            chip.appendChild(document.createTextNode(segment.label + " " + pctText(segment, mode)));
            line.appendChild(chip);
        }
        refs["legend"].appendChild(line);
    }

    if (refs["mode-toggle"].parentNode) {
        refs["mode-toggle"].setAttribute("aria-pressed", String(mode === "price"));
        refs["unit-kwh"].classList.toggle("band-share-unit-active", mode !== "price");
        refs["unit-eur"].classList.toggle("band-share-unit-active", mode === "price");
    }
}

// Bascule synchronisée : toutes les barres encore affichées suivent.
function setShareMode(mode) {
    currentMode = mode;
    for (let i = instances.length - 1; i >= 0; i--) {
        if (!instances[i].refs["root"].isConnected) {
            instances.splice(i, 1);
            continue;
        }
        fillBar(instances[i].refs, instances[i].share, currentMode);
    }
}

// Élément complet : barre + légende, depuis le résultat de buildPeriodShare.
export function renderBandShareBar(share) {
    const { fragment, refs } = cloneTemplate("tpl-band-share");

    // Pas de coût exploitable (données de test, période sans prix) : rendu
    // kWh permanent, sans bouton.
    const hasPrice = share.segments.length > 0 && share.segments[0].pricePct !== null;
    if (!hasPrice) {
        refs["mode-toggle"].remove();
    }
    else {
        refs["mode-toggle"].addEventListener("click", () => {
            setShareMode(currentMode === "conso" ? "price" : "conso");
        });
    }

    fillBar(refs, share, hasPrice ? currentMode : "conso");

    if (hasPrice) {
        // Élagage avant l'ajout : la barre en cours de rendu n'est pas encore
        // connectée (le fragment est appendu par l'appelant).
        for (let i = instances.length - 1; i >= 0; i--) {
            if (!instances[i].refs["root"].isConnected) {
                instances.splice(i, 1);
            }
        }
        instances.push({ refs: refs, share: share });
    }

    return fragment;
}
