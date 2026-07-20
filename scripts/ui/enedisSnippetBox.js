// Onglet « Depuis Enedis (automatique) » de l'étape 3 : affiche le script
// d'export (scripts/enedis-export/snippet.js) personnalisé avec le PRM saisi,
// et gère la copie dans le presse-papier.
export function initEnedisSnippetBox() {
    const prmInput = document.getElementById("enedisSnippetPrm");
    const codeArea = document.getElementById("enedisSnippetCode");
    const copyButton = document.getElementById("enedisSnippetCopy");
    const status = document.getElementById("enedisSnippetStatus");
    const tabLink = document.querySelector('a[href="#enedis-auto"]');

    let rawSnippet = null;

    async function loadSnippet() {
        if (rawSnippet !== null) return;
        try {
            const response = await fetch("./scripts/enedis-export/snippet.js");
            if (!response.ok) throw new Error("HTTP " + response.status);
            rawSnippet = await response.text();
        } catch (e) {
            codeArea.value = "Impossible de charger le script (" + e.message + "). Rechargez la page.";
            return;
        }
        render();
    }

    function render() {
        if (rawSnippet === null) return;
        const prm = prmInput.value.trim();
        codeArea.value = /^\d{14}$/.test(prm)
            ? rawSnippet.replace('"__PRM__"', JSON.stringify(prm))
            : rawSnippet;
    }

    async function copySnippet() {
        render();
        try {
            await navigator.clipboard.writeText(codeArea.value);
        } catch (e) {
            // Presse-papier indisponible (permission, contexte non sécurisé) :
            // repli sur la sélection du textarea.
            codeArea.select();
            document.execCommand("copy");
        }
        status.textContent = "Copié ! Collez-le dans la console de l'onglet Enedis.";
        setTimeout(() => { status.textContent = ""; }, 5000);
    }

    // Chargement paresseux : au premier affichage de l'onglet.
    if (tabLink) tabLink.addEventListener("shown.bs.tab", loadSnippet);
    prmInput.addEventListener("input", render);
    copyButton.addEventListener("click", async function () {
        await loadSnippet();
        await copySnippet();
    });
}
