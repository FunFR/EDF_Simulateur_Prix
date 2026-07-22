// Graphe horaire d'une journée : barres SVG (une par relevé, 48 pas de 30 min
// en général), hauteur proportionnelle à la consommation, couleur = bande
// horaire du tarif (via tariffDisplay). Aucune dépendance : SVG construit à la
// main, tooltip natif <title> par barre, repères d'heures discrets.
import { hourBand, bandColumns } from './tariffDisplay.js';

const SVG_NS = "http://www.w3.org/2000/svg";

const WIDTH = 480;
const BAR_TOP = 6;
const BASELINE_Y = 88;
const LABEL_Y = 102;
const ERROR_HEIGHT = 24;

// Encre discrète du graphe (mêmes tons que la palette validée).
const MUTED_INK = "#898781";
const BASELINE_COLOR = "#C3C9D4";
const ERROR_FILL = "#E2E6EC";

// Modèle des barres (fonction pure, testée sous node) : une entrée par relevé.
export function buildBars(day, display) {
    return (day.hours || []).map(hour => {
        const error = isNaN(hour.conso);
        return {
            label: String(hour.time.hour).padStart(2, "0") + ":" + String(hour.time.minute).padStart(2, "0"),
            conso: error ? null : hour.conso,
            price: isNaN(hour.price) ? null : hour.price,
            band: hourBand(hour.type, display),
            error: error
        };
    });
}

// Élément complet : graphe + légende des bandes (omise pour une bande unique,
// le titre de colonne suffit).
export function renderDayChart(day, display) {
    const container = document.createElement("div");
    container.className = "day-chart";
    container.appendChild(renderSvg(buildBars(day, display)));

    const columns = bandColumns(display);
    if (columns.length > 1) {
        const legend = document.createElement("div");
        legend.className = "day-chart-legend small text-muted";
        for (const band of columns) {
            const chip = document.createElement("span");
            chip.className = "me-3 text-nowrap";
            const dot = document.createElement("span");
            dot.className = "band-dot";
            dot.style.backgroundColor = band.color;
            chip.appendChild(dot);
            chip.appendChild(document.createTextNode(band.label));
            legend.appendChild(chip);
        }
        container.appendChild(legend);
    }
    return container;
}

function renderSvg(bars) {
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", "0 0 " + WIDTH + " 110");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "Consommation par demi-heure");

    const maxConso = Math.max(1, ...bars.filter(b => !b.error).map(b => b.conso));
    const slot = WIDTH / Math.max(1, bars.length);
    const barWidth = Math.max(1, slot - 2); // 2px d'écart entre barres

    bars.forEach((bar, index) => {
        const height = bar.error
            ? ERROR_HEIGHT
            : Math.max(bar.conso > 0 ? 1 : 0, (bar.conso / maxConso) * (BASELINE_Y - BAR_TOP));
        if (height === 0) {
            return;
        }
        const rect = document.createElementNS(SVG_NS, "rect");
        rect.setAttribute("x", (index * slot + 1).toFixed(2));
        rect.setAttribute("y", (BASELINE_Y - height).toFixed(2));
        rect.setAttribute("width", barWidth.toFixed(2));
        rect.setAttribute("height", height.toFixed(2));
        rect.setAttribute("rx", "1.5");
        rect.setAttribute("fill", bar.error ? ERROR_FILL : bar.band.color);

        const title = document.createElementNS(SVG_NS, "title");
        title.textContent = bar.error
            ? bar.label + " — relevé en erreur"
            : bar.label + " — " + Math.round(bar.conso) + " Wh — " + bar.price.toFixed(2) + " € — " + bar.band.label;
        rect.appendChild(title);
        svg.appendChild(rect);
    });

    const baseline = document.createElementNS(SVG_NS, "line");
    baseline.setAttribute("x1", "0");
    baseline.setAttribute("x2", String(WIDTH));
    baseline.setAttribute("y1", String(BASELINE_Y));
    baseline.setAttribute("y2", String(BASELINE_Y));
    baseline.setAttribute("stroke", BASELINE_COLOR);
    baseline.setAttribute("stroke-width", "1");
    svg.appendChild(baseline);

    for (const hour of [0, 6, 12, 18, 24]) {
        const text = document.createElementNS(SVG_NS, "text");
        text.setAttribute("x", String((hour / 24) * WIDTH));
        text.setAttribute("y", String(LABEL_Y));
        text.setAttribute("font-size", "9");
        text.setAttribute("fill", MUTED_INK);
        text.setAttribute("text-anchor", hour === 0 ? "start" : (hour === 24 ? "end" : "middle"));
        text.textContent = hour + "h";
        svg.appendChild(text);
    }

    return svg;
}
