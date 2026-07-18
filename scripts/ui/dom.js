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
