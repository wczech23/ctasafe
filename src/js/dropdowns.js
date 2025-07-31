// Hour Dropdown Elements
const enter_hour = document.getElementById("hour_ent");
for (let i = 1; i <= 12; i++) {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = i;
    enter_hour.appendChild(option);
}
const exit_hour = document.getElementById("hour_ext");
for (let i = 1; i <= 12; i++) {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = i;
    exit_hour.appendChild(option);
}
// Line Dropdown Elements
const lineDropdown_enter = document.getElementById("lineDropdown_ent");
const stationDropdown_enter = document.getElementById("stationDropdown_ent");

const lineDropdown_exit = document.getElementById("lineDropdown_ext");
const stationDropdown_exit = document.getElementById("stationDropdown_ext");

// lineDropdown Event Listeners
lineDropdown_enter.addEventListener("change", function () {
    const line = this.value.toLowerCase();
    if (!line) {
        stationDropdown_enter.innerHTML = '<option value="">-- Select a station --</option>';
        return;
    }

    const csvFile = `stop_data/${line}_line_stops.csv`;

    fetch(csvFile)
        .then(response => response.text())
        .then(data => {
        const lines = data.trim().split('\n');
        const headers = lines[0].split(',');

        const nameIndex = headers.indexOf("STATION_NAME");
        if (nameIndex === -1) {
            console.error("STATION_NAME column not found");
            return;
        }

        // Clear and repopulate station dropdown
        stationDropdown_enter.innerHTML = '<option value="">-- Select a station --</option>';
        lines.slice(1).forEach(row => {
            const cols = row.split(',');
            const stationName = cols[nameIndex];
            const option = document.createElement("option");
            option.value = stationName;
            option.textContent = stationName;
            stationDropdown_enter.appendChild(option);
        });
        })
        .catch(error => {
        console.error("Error loading CSV:", error);
        });
});

lineDropdown_exit.addEventListener("change", function () {
    const line = this.value.toLowerCase();
    if (!line) {
        stationDropdown_exit.innerHTML = '<option value="">-- Select a station --</option>';
        return;
    }

    const csvFile = `stop_data/${line}_line_stops.csv`;

    fetch(csvFile)
        .then(response => response.text())
        .then(data => {
        const lines = data.trim().split('\n');
        const headers = lines[0].split(',');

        const nameIndex = headers.indexOf("STATION_NAME");
        if (nameIndex === -1) {
            console.error("STATION_NAME column not found");
            return;
        }

        // Clear and repopulate station dropdown
        stationDropdown_exit.innerHTML = '<option value="">-- Select a station --</option>';
        lines.slice(1).forEach(row => {
            const cols = row.split(',');
            const stationName = cols[nameIndex];
            const option = document.createElement("option");
            option.value = stationName;
            option.textContent = stationName;
            stationDropdown_exit.appendChild(option);
        });
        })
        .catch(error => {
        console.error("Error loading CSV:", error);
        });
});
