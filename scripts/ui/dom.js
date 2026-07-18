// Clone un <template> et prépare son hydratation :
// - les nœuds texte d'indentation sont retirés (le DOM généré historiquement par
//   createElement n'en contenait aucun ; les espaces significatifs sont insérés
//   explicitement par les fonctions de rendu),
// - les ancres data-ref sont collectées dans `refs` puis retirées du DOM final.
export function cloneTemplate(id) {
    const fragment = document.getElementById(id).content.cloneNode(true);

    const walker = document.createTreeWalker(fragment, NodeFilter.SHOW_TEXT);
    const whitespaceNodes = [];
    while (walker.nextNode()) {
        if (!walker.currentNode.textContent.trim()) {
            whitespaceNodes.push(walker.currentNode);
        }
    }
    whitespaceNodes.forEach(node => node.remove());

    const refs = {};
    fragment.querySelectorAll("[data-ref]").forEach(el => {
        refs[el.dataset.ref] = el;
        el.removeAttribute("data-ref");
    });

    return { fragment, refs };
}

export function setOptions(select, options, selectedValue) {
    select.innerHTML = "";
    options.forEach(option => {
        const optionElement = document.createElement("option");
        optionElement.value = option.value;
        optionElement.text = option.text;
        select.appendChild(optionElement);
    });
    select.value = selectedValue;
}
