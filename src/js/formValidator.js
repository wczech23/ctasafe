const submitBtn = document.getElementById("submitBtn");

const requiredInputs = [
document.getElementById("lineDropdown_ent"),
document.getElementById("stationDropdown_ent"),
document.getElementById("hour_ent"),
document.getElementById("minute_ent"),
document.getElementById("ampm_ent"),
document.getElementById("lineDropdown_ext"),
document.getElementById("stationDropdown_ext"),
document.getElementById("hour_ext"),
document.getElementById("minute_ext"),
document.getElementById("ampm_ext")
];

// function validate form
function validateForm() {
const allFilled = requiredInputs.every(input => input.value && !input.value.includes("Select"));
submitBtn.disabled = !allFilled;
}

// function call when form input changes
requiredInputs.forEach(input => input.addEventListener("change", validateForm));

// submit button event listener
submitBtn.addEventListener("click", () => {
const data = {
    entering: {
    line: document.getElementById("lineDropdown_ent").value,
    station: document.getElementById("stationDropdown_ent").value,
    time: `${document.getElementById("hour_ent").value}:${document.getElementById("minute_ent").value} ${document.getElementById("ampm_ent").value}`
    },
    exiting: {
    line: document.getElementById("lineDropdown_ext").value,
    station: document.getElementById("stationDropdown_ext").value,
    time: `${document.getElementById("hour_ext").value}:${document.getElementById("minute_ext").value} ${document.getElementById("ampm_ext").value}`
    }
};
console.log("Form submitted with data:", data);
// TODO: create filter data function call
});