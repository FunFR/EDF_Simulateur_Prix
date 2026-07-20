import { viewManager } from './ui/viewManager.js';
import { initImportView } from './ui/importView.js';
import { initResultsView } from './ui/resultsView.js';
import { runSimulation } from './core/simulation.js';
import { sumPeriod } from './core/calculator.js';

viewManager.init();

// L'agrégation par période est injectée : les modules ui/ ne dépendent pas de core/.
const resultsView = initResultsView({ sumPeriod });

const importView = initImportView({
    onStart: function () {
        viewManager.show("import");
        history.pushState({ view: "import", step: 1 }, "");
    },
    onStepForward: function (step) {
        history.pushState({ view: "import", step: step }, "");
    },
    onSimulate: function (settings, data) {
        const simulation = runSimulation(settings, data);
        viewManager.show("prices");
        resultsView.show(simulation);
        history.pushState({ view: "prices" }, "");
    }
});

// Le Retour navigateur remplace le bouton Précédent : chaque avancée (Commencer,
// Suivant, Simuler) pousse une entrée {view, step} et popstate ré-applique l'état.
// Les vues ne sont jamais détruites : Retour/Avancer conservent réglages et CSV.
window.addEventListener("popstate", function (event) {
    const state = event.state || { view: "presentation" };
    if (state.view === "prices") {
        viewManager.show("prices");
    } else if (state.view === "import") {
        viewManager.show("import");
        importView.goToStep(state.step || 1);
    } else {
        viewManager.show("presentation");
    }
});
