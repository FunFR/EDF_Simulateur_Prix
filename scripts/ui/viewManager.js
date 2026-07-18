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
    }
};
