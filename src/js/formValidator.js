import { mapDisplay } from './mapDisplay.js';


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
    const timePart = timeStr.split('T')[1];
    const [hour, minute, secondAndMs] = timePart.split(':');
    const date = new Date();
    date.setHours(parseInt(hour), parseInt(minute), 0, 0); // ignore milliseconds if not needed
    return date;
}

function haversineDistance(latDiff, lonDiff, lat1, lat2) {
    const toRadians = degrees => degrees * Math.PI / 180;
    
    const R = 3958.8;

    const dLat = toRadians(latDiff);
    const dLon = toRadians(lonDiff);

    const lat1Rad = toRadians(lat1);
    const lat2Rad = toRadians(lat2);

    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(lat1Rad) * Math.cos(lat2Rad) *
              Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

function getStats(data, columnName) {
  let values = [];

  data.forEach(row => {
    const val = parseFloat(row[columnName]);
    if (!isNaN(val)) {
      values.push(val);
    }
  });

  const count = values.length;
  if (count === 0) return { mean: null, stdDev: null };

  const sum = values.reduce((acc, val) => acc + val, 0);
  const mean = sum / count;

  const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / count;
  const stdDev = Math.sqrt(variance);

  return {
    mean: parseFloat(mean.toFixed(2)),
    stdDev: parseFloat(stdDev.toFixed(2))
  };
}

function normalizeZ(z, minZ, maxZ) {
  return (z - minZ) / (maxZ - minZ);
}

function interpolateColor(zNorm) {
  // Clamp to [0,1]
  zNorm = Math.max(0, Math.min(1, zNorm));

  // Red (139, 0, 0), Gray (211, 211, 211)
  const r = Math.round(139 + zNorm * (211 - 139));
  const g = Math.round(0 + zNorm * (211 - 0));
  const b = Math.round(0 + zNorm * (211 - 0));

  return `rgb(${r},${g},${b})`;
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

async function calcAndFilter(coords,time) {
    // create calculated dist column using haversine function
    // create calculated time column using subtr
    // filter rows (1 mile radius)
    try {
        const rows = await new Promise((resolve, reject)=> {
            Papa.parse("chicago_crime_data.csv", {
                download: true,
                header: true,
                dynamicTyping: true,
                complete: function(results) {
                    const uploadedData = results.data;
                    console.log("Crime Data CSV loaded:", uploadedData);
                    let updatedData = uploadedData
                        .filter(row => {
                            // filter rows 
                            const lat = parseFloat(row.latitude);
                            const lon = parseFloat(row.longitude);
                            const timeStr = row.date_of_occurrence;
                            //console.log(typeof timeStr, timeStr);
                            if (isNaN(lat) || isNaN(lon) || !timeStr) return false;
                            const latDiff = coords[0] - lat;
                            const lonDiff = coords[1] - lon;
                            const distance = haversineDistance(latDiff, lonDiff, coords[0], lat);
                            //console.log(distance);
                            return distance <= 1;
                        })
                        .map(row => {
                            // find difference in distance
                            const lat = parseFloat(row.latitude);
                            const lon = parseFloat(row.longitude);
                            const latDiff = coords[0] - lat;
                            const lonDiff = coords[1] - lon;
                            row.distance_diff = parseFloat(haversineDistance(latDiff, lonDiff, coords[0], lat).toFixed(2) * 10);
                            // find difference in time
                            const diffMs = Math.abs(parseDatasetTime(row.date_of_occurrence) - time);
                            row.time_diff = parseFloat((diffMs / 3600000).toFixed(2));
                            row.rel_score = row.distance_diff + row.time_diff;
                            return row;
                        });
                    console.log("updated rows", updatedData);
                    // find avg + stdev of updated data
                    const stats = getStats(updatedData, "rel_score");
                    console.log("rel_score stats: ", stats.mean, stats.stdDev);
                    // create final scoring w/ color scale
                    let minZscore = 100;
                    let maxZscore = -100;
                    updatedData.map(row => {
                        row.z_score = (row.rel_score - stats.mean) / stats.stdDev;
                        if (row.z_score < minZscore) {
                            minZscore = row.z_score;
                        } else if (row.z_score > maxZscore) {
                            maxZscore = row.z_score;
                        }
                    });
                    console.log("z score extremes: ", minZscore, maxZscore);
                    updatedData.map(row => {
                        const zNorm = normalizeZ(row.z_score, minZscore, maxZscore);
                        row.color = interpolateColor(zNorm);
                    });
                    // return rows
                    resolve(updatedData); 
                },
                error: function(err) {
                    reject(err);
                }
            });
          
        });
        return rows;
    } catch (error) {
        console.error("Error loading CSV:", error);
        return "";
    }
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
    return {crime_data: ret_rows, coordinates: coords};
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
submitBtn.addEventListener("click", async () => {
    document.getElementById("form-container").style.display = "none";
    document.getElementById("submitBtn").style.display = "none";
    document.getElementById("loading-screen").style.display = "flex";

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

    try {
        const enter_data = await generateRows(data.entering);
        const exit_data = await generateRows(data.exiting);
        console.log("Enter Rows:", enter_data);
        console.log("Exit Rows:", exit_data);
        mapDisplay(enter_data.crime_data, enter_data.coordinates, "left"); // function exists in map display file
        //mapDisplay(exit_rows, "right");
    } catch (error) {
        console.error("Error generating rows:", error);
        // Optionally show an error message
    } finally {
        // Hide loading screen
        document.getElementById("loading-screen").style.display = "none";
    }
});