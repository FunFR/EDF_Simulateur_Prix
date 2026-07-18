import { calculator } from '../core/calculator.js';
import { getMonthName } from '../utils/date.js';
import { cloneTemplate } from './dom.js';

// Rendu de l'écran de résultats : table de comparaison des tarifs et accordéons
// de détail mensuel/journalier. Le HTML vit dans les <template> d'index.html ;
// ce module se contente de les cloner et d'y injecter les valeurs.
export function render(container, calculatedMonths, dateBegin, dateEnd) {
    container.innerHTML = "";

    const resultsForPeriod = calculatedMonths.map((t) => {
        return {
            tarif: calculator.calculateTarifForPeriod(t.allMonths, dateBegin, dateEnd),
            title: t.title,
            lastUpdate: t.lastUpdate,
            subscription_url: t.subscription_url
        }
    });

    const consoForPeriod = resultsForPeriod[0].tarif.conso;
    const resultsOrdered = [...resultsForPeriod].sort((a, b) => a.tarif.price - b.tarif.price);

    const summary = cloneTemplate("tpl-result-summary");
    summary.refs["conso-title"].textContent =
        "Consommation  totale pour cette période : " + (consoForPeriod / 1000).toFixed(2) + "kWh";
    const resultsBody = summary.refs["results-body"];
    container.appendChild(summary.fragment);

    resultsOrdered.forEach((result, index) => {
        resultsBody.appendChild(renderTarifRow(result, index, resultsOrdered[0], dateBegin));
    });
}

function renderTarifRow(result, index, bestResult, dateBegin) {
    const accordionRowId = dateBegin.getFullYear() + "-" + index;
    const { fragment, refs } = cloneTemplate("tpl-tarif-row");
    const monthCount = result.tarif.months.length;

    refs["main-row"].setAttribute("data-bs-target", "#" + accordionRowId);
    refs["name-cell"].setAttribute("data-bs-target", "#" + accordionRowId);
    refs["accordion-row"].id = accordionRowId;

    refs["title"].textContent = result.title;
    refs["last-update"].textContent = `Dernière mise à jour : ${result.lastUpdate}`;
    if (result.subscription_url) {
        refs["provider-link"].href = result.subscription_url;
        refs["provider-link"].addEventListener("click", openProviderLink);
    }
    else {
        refs["link-br"].remove();
        refs["provider-link"].remove();
    }

    insertTextBeforeSup(refs["monthly-price"], (result.tarif.price / monthCount).toFixed(2));
    setTextAroundBr(refs["total-price"], "soit " + result.tarif.price.toFixed(2) + " €", " pour la période.");

    if (index == 0) {
        refs["diff-main"].appendChild(cloneTemplate("tpl-diff-best").fragment);
    }
    else {
        const diff = cloneTemplate("tpl-diff-worse");
        const priceDiff = result.tarif.price - bestResult.tarif.price;
        insertTextBeforeSup(diff.refs["diff-badge"], " " + (priceDiff / monthCount).toFixed(2));
        setTextAroundBr(diff.refs["diff-total"], "+ " + priceDiff.toFixed(2) + " €", " sur ces " + monthCount + " mois.");
        refs["diff-main"].appendChild(diff.refs["diff-badge"]);
        refs["diff-container"].appendChild(diff.fragment);
    }

    result.tarif.months.forEach((m) => {
        refs["accordion-cell"].appendChild(renderMonthDetail(m));
    });

    return fragment;
}

function renderMonthDetail(m) {
    const { fragment, refs } = cloneTemplate("tpl-month-detail");
    refs["month-name"].textContent = getMonthName(parseInt(m.month));
    refs["month-summary"].textContent = (m.conso / 1000).toFixed(2) + "kWh / " + m.price.toFixed(2) + "€";

    refs["daily-header"].appendChild(cloneTemplate("tpl-day-header").fragment);

    //Les jours sont affichés du plus récent au plus ancien
    for (let j = m.days.length - 1; j >= 0; j--) {
        refs["daily-table"].appendChild(renderDayRow(m.days[j]));
    }

    return fragment;
}

function renderDayRow(day) {
    const hasError = isNaN(day.conso) || isNaN(day.price);
    const { fragment, refs } = cloneTemplate(hasError ? "tpl-day-row-error" : "tpl-day-row");

    refs["date"].textContent = day.date;
    if (!hasError) {
        refs["conso"].textContent = (day.conso / 1000).toFixed(2) + "kWh";
        refs["conso-hc"].textContent = (day.consoHC / 1000).toFixed(2) + "kWh";
        refs["price-hc"].textContent = day.priceHC.toFixed(2) + "€";
        refs["conso-hp"].textContent = (day.consoHP / 1000).toFixed(2) + "kWh";
        refs["price-hp"].textContent = day.priceHP.toFixed(2) + "€";
        refs["price"].textContent = day.price.toFixed(2) + "€";
    }

    return fragment;
}

// Ouvre le site du fournisseur sans déclencher l'accordéon Bootstrap parent.
// https://github.com/thednp/bootstrap.native/issues/398#issuecomment-737493055
function openProviderLink(event) {
    if (event.shiftKey) {
        window.open(event.currentTarget.href);
    } else {
        window.open(event.currentTarget.href, '_blank');
    }
    event.stopImmediatePropagation();
    event.preventDefault();
}

// Les badges mélangent texte dynamique et balises (<sup>, <br/>) : ces helpers
// insèrent les nœuds texte aux positions attendues par les templates.
function insertTextBeforeSup(badge, text) {
    badge.insertBefore(document.createTextNode(text), badge.querySelector("sup"));
}

function setTextAroundBr(badge, before, after) {
    badge.insertBefore(document.createTextNode(before), badge.querySelector("br"));
    badge.appendChild(document.createTextNode(after));
}
