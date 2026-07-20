// Wizard générique : navigation séquentielle entre des étapes affichées/masquées
// par la classe .active. Aucune connaissance métier : la validité de chaque
// étape est fournie par l'appelant via setStepValid. Pas de bouton Précédent :
// le retour se fait par l'historique navigateur, onNext signale les avancées
// utilisateur pour que l'appelant pousse une entrée d'historique (goTo, appelé
// depuis un popstate, ne doit rien pousser).
export function createWizard({ steps, stepper, nextButton, finalActionButton, onNext }) {
    let current = 1;
    const validity = new Map();
    const stepperItems = stepper ? Array.from(stepper.querySelectorAll("[data-step]")) : [];

    function isValid(step) {
        return validity.get(step) !== false;
    }

    function updateButtons() {
        nextButton.classList.toggle("d-none", current === steps.length);
        nextButton.disabled = !isValid(current);
        finalActionButton.classList.toggle("d-none", current !== steps.length);
    }

    function updateStepper() {
        stepperItems.forEach(item => {
            const step = parseInt(item.dataset.step);
            item.classList.toggle("active", step === current);
            item.classList.toggle("done", step < current);
        });
    }

    function goTo(step) {
        current = Math.min(Math.max(step, 1), steps.length);
        steps.forEach((el, i) => el.classList.toggle("active", i + 1 === current));
        updateStepper();
        updateButtons();
    }

    function setStepValid(step, ok) {
        validity.set(step, ok);
        if (step === current) {
            updateButtons();
        }
    }

    nextButton.addEventListener("click", () => {
        goTo(current + 1);
        if (onNext) {
            onNext(current);
        }
    });
    goTo(1);

    return { goTo, setStepValid, get current() { return current; } };
}
