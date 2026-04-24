const API = "https://college-bus-tracking-system-zeam.onrender.com/location";

var map = L.map('map').setView([0, 0], 15);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// create marker once
var marker = L.marker([0, 0]).addTo(map);

// debugging: show what's received
async function updateBus() {
  try {
    const res = await fetch(API, { cache: "no-store" });
    const data = await res.json();

    console.log("Received from API:", data);

    // IMPORTANT: ensure numbers (not strings)
    const lat = Number(data.lat);
    const lng = Number(data.lng);

    if (!isFinite(lat) || !isFinite(lng)) {
      console.warn("Invalid coords:", data);
      return;
    }

    marker.setLatLng([lat, lng]);
    map.setView([lat, lng], 15);

  } catch (err) {
    console.error("Fetch error:", err);
  }
}

// run immediately + repeat
updateBus();
setInterval(updateBus, 5000);