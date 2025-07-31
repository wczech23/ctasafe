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

// Example usage:
const chicago = [41.875706,-87.673932];
const la = [41.870028132,-87.708823855];
const latDiff = chicago[0] - la[0];
const lonDiff = chicago[1] - la[1];

const distance = haversineDistance(latDiff, lonDiff, chicago[0], la[0]);
console.log(`Distance: ${distance.toFixed(2)} miles`);
