export function mapDisplay(rowData, coords, container_id) {
    
    const map = L.map(container_id).setView([coords[0], coords[1]], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    rowData.forEach(row => {
        L.circleMarker([+row.latitude,+row.longitude], 
        { 
            radius: 3,
            color: row.color,
            fillColor: row.color,
            fillOpacity: 1,
            weight: 1
        })
        .bindPopup(`${row.name}<br>${row.date_of_occurrence}`)
        .addTo(map)
    });
    console.log(rowData);
    // add marker for train stop
    const customIcon = L.icon({
        iconUrl: 'train_marker.png',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    });
    L.marker([coords[0], coords[1]], { icon: customIcon }).addTo(map);
    // make display available
    document.getElementById(container_id).style.display = "flex";
    const heading_id = container_id + "_header";
    console.log(heading_id);
    document.getElementById(heading_id).style.display = "flex";
} 