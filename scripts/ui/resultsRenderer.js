import { calculator } from '../core/calculator.js';
import { getMonthName } from '../utils/date.js';

// Rendu de l'écran de résultats : table de comparaison des tarifs et
// accordéons de détail mensuel/journalier. Fonction pure données -> DOM.
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

    const divYear = document.createElement("div");
    divYear.className = "mb-4 p-0";
    container.appendChild(divYear);
    const titleConsoContainer = document.createElement("div");
    titleConsoContainer.className = "position-relative py-2 px-4 text-center border border-info rounded-pill";
    const titleConso = document.createElement("h5");
    titleConso.innerText = "Consommation  totale pour cette période : " + (consoForPeriod / 1000).toFixed(2) + "kWh";
    titleConsoContainer.appendChild(titleConso);
    divYear.appendChild(titleConsoContainer);
    titleConso.className = "mt-1 mb-1";

    //ajout de la table responsive
    const divResponsive = document.createElement('div');
    divResponsive.className = "mt-2 table-responsive";

    const table = document.createElement("table");
    table.className = "resultable table mt-3 align-middle table-striped-columns table-hover table-borderless table-sm";
    // Attacher le tableau à la div
    divResponsive.appendChild(table);
    divYear.appendChild(divResponsive);


    const tableHeader = document.createElement("thead");
    table.appendChild(tableHeader);
    const rowHeader = document.createElement("tr");
    tableHeader.appendChild(rowHeader);
    const headerTarifName = document.createElement("th");
    headerTarifName.innerHTML = "Abonnement électrique";
    headerTarifName.className = "align-middle";
    headerTarifName.style = "padding-left: 20px";
    rowHeader.appendChild(headerTarifName);
    const headerEstimationName = document.createElement("th");
    headerEstimationName.innerHTML = "Estimation de coût";
    headerEstimationName.className = "text-center";
    rowHeader.appendChild(headerEstimationName);
    const headerDifferenceName = document.createElement("th");
    headerDifferenceName.innerHTML = "Diff. avec le plus avantageux";
    headerDifferenceName.className = "text-center";
    rowHeader.appendChild(headerDifferenceName);

    const tableBody = document.createElement("tbody");
    tableBody.className = "table-group-divider";
    table.appendChild(tableBody);

    let currentRow = 0;
    const resultsOrdered = resultsForPeriod.map((r) => ({
        tarif: r.tarif,
        title: r.title,
        lastUpdate: r.lastUpdate,
        subscription_url: r.subscription_url
    }))
        .sort((a, b) => a.tarif.price - b.tarif.price);

    resultsOrdered.forEach(result => {
        const tarifRow = document.createElement("tr");
        const accordionRowId = dateBegin.getFullYear() + "-" + currentRow;
        tableBody.appendChild(tarifRow);
        tarifRow.setAttribute("data-bs-toggle", "collapse");
        tarifRow.setAttribute("aria-expanded", "false");
        tarifRow.setAttribute("data-bs-target", "#" + accordionRowId);
        const accordionRow = document.createElement("tr");
        tableBody.appendChild(accordionRow);
        accordionRow.id = accordionRowId;
        accordionRow.className = "collapse table-secondary";

        const accordionCell = document.createElement("td");
        accordionCell.colSpan = 3;
        accordionRow.appendChild(accordionCell);

        result.tarif.months.forEach((m) => {
            const titleDetail = document.createElement("h3");
            accordionCell.appendChild(titleDetail);
            titleDetail.className = "main-title d-inline ms-2";
            const subTitleDetail = document.createElement("h4");
            accordionCell.appendChild(subTitleDetail);
            subTitleDetail.className = "sub-title float-end";

            titleDetail.innerHTML = getMonthName(parseInt(m.month));
            subTitleDetail.innerHTML = (m.conso / 1000).toFixed(2) + "kWh / " + m.price.toFixed(2) + "€";

            const tableDailyDetail = document.createElement("table");
            tableDailyDetail.className = "mt-2 ms-2 table table-striped table-sm align-middle";
            accordionCell.appendChild(tableDailyDetail);
            const headerDailyDetail = document.createElement("thead");
            tableDailyDetail.appendChild(document.createElement("thead").appendChild(headerDailyDetail));
            headerDailyDetail.className = "align-middle";
            const cell1HeaderDailyDetail = document.createElement("th");
            const cell2HeaderDailyDetail = document.createElement("th");
            const cell3HeaderDailyDetail = document.createElement("th");
            const cell4HeaderDailyDetail = document.createElement("th");
            const cell5HeaderDailyDetail = document.createElement("th");
            const cell6HeaderDailyDetail = document.createElement("th");
            const cell7HeaderDailyDetail = document.createElement("th");
            cell1HeaderDailyDetail.innerHTML = "Jour";
            cell1HeaderDailyDetail.className = "text-start";

            cell2HeaderDailyDetail.innerHTML = "Conso totale";
            cell2HeaderDailyDetail.className = "text-center";

            cell3HeaderDailyDetail.innerHTML = "Conso HC";
            cell3HeaderDailyDetail.className = "text-center";

            cell4HeaderDailyDetail.innerHTML = "Esti. HC (€)";
            cell4HeaderDailyDetail.className = "text-center";

            cell5HeaderDailyDetail.innerHTML = "Conso HP";
            cell5HeaderDailyDetail.className = "text-center";

            cell6HeaderDailyDetail.innerHTML = "Esti. HP (€)";
            cell6HeaderDailyDetail.className = "text-center";

            cell7HeaderDailyDetail.innerHTML = "Total (€)";
            cell7HeaderDailyDetail.className = "text-end";

            headerDailyDetail.appendChild(cell1HeaderDailyDetail);
            headerDailyDetail.appendChild(cell2HeaderDailyDetail);
            headerDailyDetail.appendChild(cell3HeaderDailyDetail);
            headerDailyDetail.appendChild(cell4HeaderDailyDetail);
            headerDailyDetail.appendChild(cell5HeaderDailyDetail);
            headerDailyDetail.appendChild(cell6HeaderDailyDetail);
            headerDailyDetail.appendChild(cell7HeaderDailyDetail);

            for (let j = m.days.length - 1; j >= 0; j--) {
                const bodyDailyDetail = document.createElement("tr");
                tableDailyDetail.appendChild(document.createElement("tbody").appendChild(bodyDailyDetail));

                const cell1BodyDailyDetail = document.createElement("td");
                cell1BodyDailyDetail.innerHTML = m.days[j].date;
                cell1BodyDailyDetail.className = "text-start";

                bodyDailyDetail.appendChild(cell1BodyDailyDetail);

                //S'il n'y a pas d'erreur lors du calcul de la journée, on affiche les informations
                if (!isNaN(m.days[j].conso) && !isNaN(m.days[j].price)) {
                    const cell2BodyDailyDetail = document.createElement("td");
                    cell2BodyDailyDetail.className = "text-center align-middle";

                    const cell3BodyDailyDetail = document.createElement("td");
                    cell3BodyDailyDetail.className = "text-center align-middle";

                    const cell4BodyDailyDetail = document.createElement("td");
                    cell4BodyDailyDetail.className = "text-center align-middle";

                    const cell5BodyDailyDetail = document.createElement("td");
                    cell5BodyDailyDetail.className = "text-center align-middle";

                    const cell6BodyDailyDetail = document.createElement("td");
                    cell6BodyDailyDetail.className = "text-center align-middle";

                    const cell7BodyDailyDetail = document.createElement("td");
                    cell7BodyDailyDetail.className = "text-end align-middle";

                    cell2BodyDailyDetail.innerHTML = (m.days[j].conso / 1000).toFixed(2) + "kWh";
                    cell3BodyDailyDetail.innerHTML = (m.days[j].consoHC / 1000).toFixed(2) + "kWh";
                    cell4BodyDailyDetail.innerHTML = m.days[j].priceHC.toFixed(2) + "€";
                    cell5BodyDailyDetail.innerHTML = (m.days[j].consoHP / 1000).toFixed(2) + "kWh";
                    cell6BodyDailyDetail.innerHTML = m.days[j].priceHP.toFixed(2) + "€";
                    cell7BodyDailyDetail.innerHTML = m.days[j].price.toFixed(2) + "€";
                    bodyDailyDetail.appendChild(cell2BodyDailyDetail);
                    bodyDailyDetail.appendChild(cell3BodyDailyDetail);
                    bodyDailyDetail.appendChild(cell4BodyDailyDetail);
                    bodyDailyDetail.appendChild(cell5BodyDailyDetail);
                    bodyDailyDetail.appendChild(cell6BodyDailyDetail);
                    bodyDailyDetail.appendChild(cell7BodyDailyDetail);
                }
                else {
                    const cellError = document.createElement("td");
                    cellError.className = "text-center align-middle fw-bold";
                    cellError.colSpan = 7;
                    cellError.innerHTML = "Erreur lors du calcul de la journée";
                    bodyDailyDetail.appendChild(cellError);
                }
            }
        });

        const cellTarifName = document.createElement("th");
        cellTarifName.className = "align-middle";
        tarifRow.appendChild(cellTarifName);

        const tarifIcon = document.createElement("i");
        tarifIcon.className = "fa-solid fa-square-caret-right ms-3";

        const tarifName = document.createElement("span");
        tarifName.className = "ms-2";
        tarifName.innerHTML = result.title;

        const moreInfoContainer = document.createElement("div");
        moreInfoContainer.className = "fw-normal";

        const tarifLastUpdate = document.createElement("span");
        tarifLastUpdate.className = "ms-2";
        tarifLastUpdate.innerHTML = `Dernière mise à jour : ${result.lastUpdate}`;
        moreInfoContainer.appendChild(tarifLastUpdate);

        if (result.subscription_url) {
            const lineReturn = document.createElement("br");
            moreInfoContainer.appendChild(lineReturn);
            const tarifUrl = document.createElement("a");
            tarifUrl.className = "ms-2 providerLink";
            tarifUrl.href = result.subscription_url;
            tarifUrl.textContent = "Site du fournisseur";
            moreInfoContainer.appendChild(tarifUrl);
        }

        cellTarifName.appendChild(tarifIcon);
        cellTarifName.appendChild(tarifName);
        cellTarifName.appendChild(moreInfoContainer);

        cellTarifName.setAttribute("data-bs-toggle", "collapse");
        cellTarifName.setAttribute("data-bs-target", "#" + accordionRowId);

        const cellTarifPrice = document.createElement("td");
        cellTarifPrice.className = "text-center align-middle";
        tarifRow.appendChild(cellTarifPrice);


        const containerTarifPrice = document.createElement("div");
        containerTarifPrice.className = "container justify-content-center";

        const titleMonthlyTarifPrice = document.createElement("div");
        titleMonthlyTarifPrice.className = "h4 row";
        const spanMonthlyTarifPrice = document.createElement("span");
        spanMonthlyTarifPrice.className = "badge fw-bold text-bg-info";
        spanMonthlyTarifPrice.innerHTML = (result.tarif.price / result.tarif.months.length).toFixed(2) + "<sup> €/mois</sup>";
        titleMonthlyTarifPrice.appendChild(spanMonthlyTarifPrice);
        containerTarifPrice.appendChild(titleMonthlyTarifPrice);

        const titleTotalTarifPrice = document.createElement("div");
        titleTotalTarifPrice.className = "h5 row";
        const spanTotalTarifPrice = document.createElement("span");
        spanTotalTarifPrice.className = "badge fw-bold text-muted";
        spanTotalTarifPrice.innerHTML = "soit " + result.tarif.price.toFixed(2) + " €<br/> pour la période.";
        titleTotalTarifPrice.appendChild(spanTotalTarifPrice);
        containerTarifPrice.appendChild(titleTotalTarifPrice);

        cellTarifPrice.appendChild(containerTarifPrice);

        const cellDiffencePrice = document.createElement("td");
        cellDiffencePrice.className = "text-center align-middle";
        tarifRow.appendChild(cellDiffencePrice);

        const containerDifferenceTarifPrice = document.createElement("div");
        containerDifferenceTarifPrice.className = "container justify-content-center";

        const titleLessExpensive = document.createElement("div");
        titleLessExpensive.className = "h4 row fw-bold";
        containerDifferenceTarifPrice.appendChild(titleLessExpensive);

        const subSpanTitleLessExpensive = document.createElement("span");
        titleLessExpensive.appendChild(subSpanTitleLessExpensive);

        if (currentRow == 0) {
            subSpanTitleLessExpensive.className = "badge p-1 text-dark";
            subSpanTitleLessExpensive.innerHTML = "<i class='fa-solid fa-medal fa-lg'></i> Tarif le plus avantageux<br/><small>(selon vos données)</small>";
        }
        else {
            subSpanTitleLessExpensive.className = "badge fw-bold text-bg-warning text-white";
            subSpanTitleLessExpensive.innerHTML = "<i class='fa-solid fa-circle-plus'></i> " + ((result.tarif.price - resultsOrdered[0].tarif.price) / result.tarif.months.length).toFixed(2) + "<sup> €/mois</sup>";

            const titleTotalLessExpensive = document.createElement("div");
            titleTotalLessExpensive.className = "h5 row";

            const spanTotalLessExpensive = document.createElement("span");
            spanTotalLessExpensive.className = "badge fw-bold text-muted";
            spanTotalLessExpensive.innerHTML = "+ " + (result.tarif.price - resultsOrdered[0].tarif.price).toFixed(2) + " €<br/> sur ces " + result.tarif.months.length + " mois.";
            titleTotalLessExpensive.appendChild(spanTotalLessExpensive);
            containerDifferenceTarifPrice.appendChild(titleTotalLessExpensive);
        }

        cellDiffencePrice.appendChild(containerDifferenceTarifPrice);

        currentRow++;
    });

    // Emulate link click to force browser to open the energy provider's website when clicked
    document.querySelectorAll('.providerLink').forEach(el => {
        el.addEventListener('click', event => {
            if (event.shiftKey) {
                // Shift + Click
                window.open(event.currentTarget.href);
            } else {
                // CTRL + Click or normal click
                window.open(event.currentTarget.href, '_blank');
            }
            // Do not propagate to parent to prevent details showing - not working properly
            // https://github.com/thednp/bootstrap.native/issues/398#issuecomment-737493055
            event.stopImmediatePropagation();
            // Prevent emulated behavior to execute if bootstrap is fixed
            event.preventDefault();
        })
    });
}
