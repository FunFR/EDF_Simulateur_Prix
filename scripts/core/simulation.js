import { calculator } from './calculator.js';
import { getAbonnements } from './tarifsRegistry.js';

// Lance la simulation complète : personnalisation des abonnements d'après les
// réglages, puis calcul mensuel pour chaque abonnement compatible.
// settings : { kva, jourZenPlus, hcRawRanges, includeCommunity }
export function runSimulation(settings, data) {
    addCustomisationToAbonnements(settings);
    const calculatedMonths = calculateAllMonths(settings.kva, settings.includeCommunity, data);
    const yearsAvailable = [...new Set(calculatedMonths[0].allMonths.map(m => m.year))].sort((a, b) => a - b);
    return { calculatedMonths, yearsAvailable };
}

function addCustomisationToAbonnements(settings) {
    getAbonnements().forEach((abo) => {
        if (abo.hasSpecialDaysCustom) {
            // Note (comportement historique conservé) : chaque simulation re-pousse
            // le jour Zen+ dans specialDays sans purger les valeurs précédentes.
            abo.specialDays.push(settings.jourZenPlus);
        }
        if (abo.hasHCCustom) {
            abo.hc = buildHCRanges(settings.hcRawRanges);
        }
    });
}

function calculateAllMonths(kva, includesCommunityPrices, data) {
    let filteredAbonnements = getAbonnements().filter(a => a.prices.some(p => p.puissance == kva));
    if (!includesCommunityPrices) {
        filteredAbonnements = filteredAbonnements.filter(a => a.name.includes("EDF"));
    }
    //On filtre sur les abonnements qui correspondent à la puissance souscrite
    return filteredAbonnements.filter(a => a.prices.some(p => p.puissance == kva)).map(abo => {
        return {
            allMonths: calculator.getTarif(kva, data, abo),
            title: abo.name,
            lastUpdate: abo.lastUpdate,
            subscription_url: abo.subscription_url
        }
    });
}

// Transforme les plages brutes des inputs time ([["22:00","23:59"], ...])
// en plages HC arrondies à l'heure, en écartant les plages vides.
function buildHCRanges(hcRawRanges) {
    return hcRawRanges
        .map(([rawStart, rawEnd]) => formatHCRange(rawStart, rawEnd))
        .filter(range => range != null);
}

function formatHCRange(rawStart, rawEnd) {
    const startTime = rawStart.split(":");
    let startHours = parseInt(startTime[0]);
    let startMinutes = parseInt(startTime[1]);
    const endTime = rawEnd.split(":");
    let endHours = parseInt(endTime[0]);
    let endMinutes = parseInt(endTime[1]);

    if (startMinutes > 30) {
        startHours++;
        startMinutes = 0;
    }

    //Permet de gérer le 23:59
    if (endMinutes > 30) {
        endHours++;
        endMinutes = 0;
    }

    if (startHours >= endHours) {
        return null;
    } else {
        return {
            start: { hour: startHours, minute: startMinutes },
            end: { hour: endHours, minute: endMinutes }
        }
    }
}
