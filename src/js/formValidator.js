// function validate form
function validateForm() {
    const allFilled = requiredInputs.every(input => input.value && !input.value.includes("Select"));
    submitBtn.disabled = !allFilled;
}

function to24HourTime(timeStr) {
    const [timePart, ampm] = timeStr.trim().split(' ');
    const [hr, mt] = timePart.split(':');
    let hour = parseInt(hr);
    const minute = parseInt(mt);

    if (ampm === "PM" && hour !== 12) hour += 12;
    if (ampm === "AM" && hour === 12) hour = 0;

    const date = new Date();
    date.setHours(hour, minute, 0, 0);
    return date;
}

function parseDatasetTime(timeStr) {
    const [hour, minute, secondAndMs] = timeStr.split(':');
    const date = new Date();
    date.setHours(parseInt(hour), parseInt(minute), 0, 0); // ignore milliseconds if not needed
    return date;
}

async function loadLatLon(csvFile,station_name) {
  try {
    const coords = await new Promise((resolve,reject) => {
        Papa.parse(csvFile, {
            download: true,
            header: true,
            dynamicTyping: true,
            complete: function(results) {
                const stationData = results.data;
                console.log("Line CSV loaded:", stationData);
                const match = stationData.find(row => row.STATION_NAME == station_name);
                console.log(match);
                if (match) {
                    return resolve([match.latitude, match.longitude]);
                }
                return resolve([0,0]);
            },
            error: function(err) {
                reject(err);
            }
        });
    });
    return coords;
  } catch (error) {
    console.error("Error loading CSV:", error);
    return [0,0];
  }
}

async function calcAndFilter() {
    // create calculated dist column using haversine function
    // create calculated time column using subtr
    // filter rows (1 mile radius)
    const updatedData = uploadedData.map(row => {
    const lat = parseFloat(row.latitude);
    const lon = parseFloat(row.longitude);

    if (!isNaN(lat) && !isNaN(lon)) {
        row.distance_to_chicago_miles = haversineDistance(
        lat, lon, fixedLocation.lat, fixedLocation.lon
        ).toFixed(2);
    } else {
        row.distance_to_chicago_miles = '';
    }

    return row; // this keeps the original row + new field
    });
}

// calculate relevance score for each record
async function generateRows(submitData) {
    // get matching lat, lon data for input stop
    // convert time data
    const time = to24HourTime(submitData.time);
    const line = submitData.line.toLowerCase();
    const station_name = submitData.station;
    const csvFile = `stop_data/${line}_line_stops.csv`;
    console.log(csvFile);
    const coords = await loadLatLon(csvFile,station_name);
    console.log(coords[0],coords[1]);
    console.log(time);
    const ret_rows = await calcAndFilter(coords,time);
    return ret_rows;
}

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
    // display loading screen
    generateRows(data.entering); // store output rows
    generateRows(data.exiting);
});