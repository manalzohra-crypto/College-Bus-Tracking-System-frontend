const API = "https://college-bus-tracking-system-zeam.onrender.com/location"; // replace with your Render URL

// Initialize map
var map = L.map('map').setView([0, 0], 15);

// Load OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Default blue Leaflet marker
var marker = L.marker([0, 0]).addTo(map);

// Auto-center control
let autoCenter = true;

// Disable auto-centering when user interacts
map.on("dragstart zoomstart", function () {
  autoCenter = false;
});

// Fetch and update bus location
async function updateBus() {
  try {
    const res = await fetch(API, { cache: "no-store" });
    const data = await res.json();

    console.log("Location:", data);

    const lat = Number(data.lat);
    const lng = Number(data.lng);

    if (!isFinite(lat) || !isFinite(lng)) return;

    marker.setLatLng([lat, lng]);

    // Move map without changing zoom
    if (autoCenter) {
      map.panTo([lat, lng]);
    }

  } catch (err) {
    console.error("Error:", err);
  }
}

// Run immediately + repeat every 2 seconds
updateBus();
setInterval(updateBus, 2000);