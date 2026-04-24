const API = "https://college-bus-tracking-system-zeam.onrender.com/location"; 

// Initialize map
var map = L.map('map').setView([0, 0], 15);

// Load OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Bus icon (optional but looks better)
var busIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/61/61231.png',
  iconSize: [40, 40]
});

// Marker
var marker = L.marker([0, 0], { icon: busIcon }).addTo(map);

// Control auto-centering
let autoCenter = true;

// If user interacts → stop auto-centering
map.on("dragstart zoomstart", function () {
  autoCenter = false;
});

// Fetch and update location
async function updateBus() {
  try {
    const res = await fetch(API, { cache: "no-store" });
    const data = await res.json();

    console.log("Location:", data);

    const lat = Number(data.lat);
    const lng = Number(data.lng);

    if (!isFinite(lat) || !isFinite(lng)) return;

    marker.setLatLng([lat, lng]);

    // Only pan, don't change zoom
    if (autoCenter) {
      map.panTo([lat, lng]);
    }

  } catch (err) {
    console.error("Error:", err);
  }
}

// Run immediately + every 2 seconds
updateBus();
setInterval(updateBus, 2000);