const API = 'https://college-bus-tracking-system-zeam.onrender.com/buses';

const map = L.map('map', {
  zoomControl: true
}).setView([12.9716, 77.5946], 13); // Default Bangalore

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
}).addTo(map);

const markers = {};
let autoCenter = true;
let lastPositions = {};

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

function calculateETA(prev, curr) {
  if (!prev) return "--";

  const dist = map.distance(
    [prev.lat, prev.lng],
    [curr.lat, curr.lng]
  );

  const time = 3; // seconds interval
  const speed = dist / time; // m/s

  const eta = 500 / speed; // assume 500m stop
  return Math.round(eta) + "s";
}

async function update() {
  try {
    const res = await fetch(API);
    const data = await res.json();
    const buses = data.buses || [];

    document.getElementById('active-buses-count').textContent = buses.length;

    buses.forEach(bus => {
      const {bus_id, location} = bus;

      if (!markers[bus_id]) {
        markers[bus_id] = L.marker([location.lat, location.lng]).addTo(map);
      } else {
        smoothMove(markers[bus_id], location);
      }

      const eta = calculateETA(lastPositions[bus_id], location);
      lastPositions[bus_id] = location;

      if (autoCenter) {
        map.panTo([location.lat, location.lng], {animate:true});
      }
    });

    document.getElementById('last-update').textContent =
      new Date().toLocaleTimeString();

  } catch (e) {
    console.error(e);
  }
}

setInterval(update, 3000);
update();