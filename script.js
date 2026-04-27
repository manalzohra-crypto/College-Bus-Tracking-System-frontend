const API = 'https://college-bus-tracking-system-zeam.onrender.com/buses';

const map = L.map('map').setView([12.9716, 77.5946], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
}).addTo(map);

const markers = {};
let autoCenter = true;
let lastPositions = {};

const busFilter = document.getElementById("bus-filter");

/* DARK MODE */
const toggleBtn = document.getElementById("theme-toggle");

if(localStorage.getItem("theme") === "light"){
  document.body.classList.add("light");
}

toggleBtn.onclick = () => {
  document.body.classList.toggle("light");

  localStorage.setItem(
    "theme",
    document.body.classList.contains("light") ? "light" : "dark"
  );
};

/* CENTER TOGGLE */
document.getElementById('toggle-center').onclick = () => {
  autoCenter = !autoCenter;
};

/* SMOOTH ANIMATION */
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

/* ETA */
function calculateETA(prev, curr) {
  if (!prev) return "--";

  const dist = map.distance(
    [prev.lat, prev.lng],
    [curr.lat, curr.lng]
  );

  const time = 3;
  const speed = dist / time;

  if(speed < 0.5) return "Stopped";

  const eta = 300 / speed;
  return Math.round(eta) + " sec";
}

async function update() {
  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error("API error");

    const data = await res.json();
    const buses = data.buses || [];

    /* Populate dropdown */
    busFilter.innerHTML = '<option value="all">All Buses</option>';

    buses.forEach(bus => {
      const option = document.createElement("option");
      option.value = bus.bus_id;
      option.textContent = bus.bus_id;
      busFilter.appendChild(option);
    });

    document.getElementById("active-buses-count").textContent = buses.length;

    const selectedBus = busFilter.value;

    buses.forEach(bus => {

      if(selectedBus !== "all" && bus.bus_id !== selectedBus){
        if(markers[bus.bus_id]){
          map.removeLayer(markers[bus.bus_id]);
        }
        return;
      }

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

  } catch (e) {
    console.error("Error:", e);
  }
}

setInterval(update, 3000);
update();