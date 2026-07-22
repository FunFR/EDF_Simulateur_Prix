export const viewManager = {
    views: {},
    init: function () {
        this.views = {
            presentation: document.getElementById("presentationView"),
            import: document.getElementById("importView"),
            prices: document.getElementById("pricesResultView")
        };
        this.show("presentation");
    },
    show: function (name) {
        Object.entries(this.views).forEach(([key, view]) => {
            view.style.display = (key === name) ? "block" : "none";
        });
        // Le CSS masque les ancres de la nav sticky hors vue présentation.
        document.body.dataset.view = name;
    }
};
