import { viewManager } from './ui/viewManager.js';
import { initImportView } from './ui/importView.js';
import { initResultsView } from './ui/resultsView.js';
import { runSimulation } from './core/simulation.js';

viewManager.init();

const resultsView = initResultsView();

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
