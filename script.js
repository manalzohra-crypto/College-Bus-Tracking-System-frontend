const API = 'https://college-bus-tracking-system-zeam.onrender.com/buses';

const map = L.map('map');
let mapInitialized = false;

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
}).addTo(map);

const markers = {};

async function update() {
  try {
    const res = await fetch(API);
    const data = await res.json();
    const buses = data.buses || [];

    document.getElementById('active-buses-count').textContent = buses.length;

    if (buses.length === 0) {
      map.setView([20,0],2);
      return;
    }

    buses.forEach(bus => {
      const {bus_id, location} = bus;

      if (!mapInitialized) {
        map.setView([location.lat, location.lng], 15);
        mapInitialized = true;
      }

      if (!markers[bus_id]) {
        markers[bus_id] = L.marker([location.lat, location.lng]).addTo(map);
      } else {
        markers[bus_id].setLatLng([location.lat, location.lng]);
      }
    });

    document.getElementById('last-update').textContent =
      new Date().toLocaleTimeString();

  } catch (e) {
    console.error(e);
  }
}

update();
setInterval(update, 3000);