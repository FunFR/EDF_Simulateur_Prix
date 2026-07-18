// Wizard générique : navigation séquentielle entre des étapes affichées/masquées
// par la classe .active. Aucune connaissance métier : la validité de chaque
// étape est fournie par l'appelant via setStepValid.
export function createWizard({ steps, stepper, prevButton, nextButton, finalActionButton }) {
    let current = 1;
    const validity = new Map();
    const stepperItems = stepper ? Array.from(stepper.querySelectorAll("[data-step]")) : [];

    function isValid(step) {
        return validity.get(step) !== false;
    }

    function updateButtons() {
        prevButton.disabled = current === 1;
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

    prevButton.addEventListener("click", () => goTo(current - 1));
    nextButton.addEventListener("click", () => goTo(current + 1));
    goTo(1);

    return { goTo, setStepValid, get current() { return current; } };
}
