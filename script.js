const API = 'https://college-bus-tracking-system-zeam.onrender.com/buses';

const map = L.map('map').setView([12.9716, 77.5946], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
}).addTo(map);

const markers = {};
let autoCenter = true;

document.getElementById('toggle-center').onclick = () => {
  autoCenter = !autoCenter;
};

function smoothMove(marker, newLatLng) {
  const current = marker.getLatLng();
  const steps = 10;
  let i = 0;

  const deltaLat = (newLatLng.lat - current.lat) / steps;
  const deltaLng = (newLatLng.lng - current.lng) / steps;

  const interval = setInterval(() => {
    i++;
    marker.setLatLng([
      current.lat + deltaLat * i,
      current.lng + deltaLng * i
    ]);
    if (i >= steps) clearInterval(interval);
  }, 50);
}

async function update() {
  try {
    const res = await fetch(API);

    if (!res.ok) throw new Error("API failed");

    const data = await res.json();
    const buses = data.buses || [];

    buses.forEach(bus => {
      const {bus_id, location} = bus;

      if (!markers[bus_id]) {
        markers[bus_id] = L.marker([location.lat, location.lng]).addTo(map);
      } else {
        smoothMove(markers[bus_id], location);
      }

      if (autoCenter) {
        map.panTo([location.lat, location.lng], {animate:true});
      }
    });

  } catch (e) {
    console.error("Backend error:", e);
  }
}

setInterval(update, 3000);
update();