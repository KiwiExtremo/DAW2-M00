window.onload = init;

function init() {
    var accordions = document.getElementsByClassName("accordion-title");

    for (const accordion of accordions) {
        accordion.addEventListener("click", toggleAccordion);
    }
}

function toggleAccordion() {
    // Adds class "opened" and returns true
    if (this.classList.toggle("opened")) {
        var table = this.nextElementSibling;

        table.style.display = "block";

    } else { // Removes class "opened" and returns false
        var table = this.nextElementSibling;

        table.style.display = "none";
    }
}