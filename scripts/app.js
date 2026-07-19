import { viewManager } from './ui/viewManager.js';
import { initImportView } from './ui/importView.js';
import { initResultsView } from './ui/resultsView.js';
import { runSimulation } from './core/simulation.js';
import { sumPeriod } from './core/calculator.js';

viewManager.init();

// L'agrégation par période est injectée : les modules ui/ ne dépendent pas de core/.
const resultsView = initResultsView({ sumPeriod });

initImportView({
    onStart: function () {
        viewManager.show("import");
    },
    onSimulate: function (settings, data) {
        const simulation = runSimulation(settings, data);
        viewManager.show("prices");
        resultsView.show(simulation);
    }
});
