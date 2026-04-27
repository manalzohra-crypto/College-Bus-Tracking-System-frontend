const API = 'https://college-bus-tracking-system-zeam.onrender.com/buses';

const map = L.map('map').setView([12.9716, 77.5946], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{z}/{x}/{y}.png'.replace('{z}/{z}', '{z}'), {
  maxZoom: 19,
}).addTo(map);

const markers = {};
let autoCenter = true;
let lastPositions = {};

const busFilter = document.getElementById("bus-filter");

/* THEME */
const toggleBtn = document.getElementById("theme-toggle");
toggleBtn.onclick = () => {
  document.body.classList.toggle("light");
};

/* CENTER */
document.getElementById('toggle-center').onclick = () => {
  autoCenter = !autoCenter;
};

/* SMOOTH */
function smoothMove(marker, newLatLng) {
  marker.setLatLng(newLatLng);
}

/* ETA */
function calculateETA(prev, curr) {
  if (!prev) return "--";

  const dist = map.distance(
    [prev.lat, prev.lng],
    [curr.lat, curr.lng]
  );

  const speed = dist / 3;
  if(speed < 0.5) return "Stopped";

  return Math.round(300 / speed) + " sec";
}

async function update() {
  try {
    const res = await fetch(API);
    const data = await res.json();
    const buses = data.buses || [];

    document.getElementById("active-buses-count").textContent = buses.length;

    /* PRESERVE SELECTION */
    const currentSelection = busFilter.value || "all";

    busFilter.innerHTML = '';
    
    const allOption = document.createElement("option");
    allOption.value = "all";
    allOption.textContent = "All Buses";
    busFilter.appendChild(allOption);

    buses.forEach(bus => {
      const option = document.createElement("option");
      option.value = bus.bus_id;
      option.textContent = bus.bus_id;
      busFilter.appendChild(option);
    });

    busFilter.value = currentSelection;

    buses.forEach(bus => {

      if(currentSelection !== "all" && bus.bus_id !== currentSelection){
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

      lastPositions[bus_id] = location;

      if (autoCenter) {
        map.panTo([location.lat, location.lng]);
      }
    });

  } catch (e) {
    console.error(e);
  }
}

setInterval(update, 3000);
update();