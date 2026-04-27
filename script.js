const API = "https://college-bus-tracking-system-zeam.onrender.com/buses";

const map = L.map("map");
let mapInitialized = false;

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
}).addTo(map);

let markers = {};
let lastPositions = {};
let autoCenter = true;
let lastCenter = null;

// CENTER BUTTON FIX
document.getElementById("center-btn").onclick = () => {
  autoCenter = true;
  if (lastCenter) map.panTo(lastCenter);
};

// DARK MODE FIX
document.getElementById("dark-btn").onclick = () => {
  document.body.classList.toggle("dark");
};

async function update() {
  try {
    const res = await fetch(API);
    const data = await res.json();
    const buses = data.buses || [];

    if (buses.length === 0) return;

    buses.forEach(bus => {
      const { bus_id, location } = bus;

      const newLatLng = [location.lat, location.lng];

      // First load
      if (!mapInitialized) {
        map.setView(newLatLng, 15);
        mapInitialized = true;
      }

      // Create marker
      if (!markers[bus_id]) {
        markers[bus_id] = L.marker(newLatLng).addTo(map);
      }

      // Smooth animation
      let prev = lastPositions[bus_id];

      if (prev) {
        let steps = 8;
        let i = 0;

        let latStep = (location.lat - prev.lat) / steps;
        let lngStep = (location.lng - prev.lng) / steps;

        let anim = setInterval(() => {
          i++;
          let lat = prev.lat + latStep * i;
          let lng = prev.lng + lngStep * i;

          markers[bus_id].setLatLng([lat, lng]);

          if (i >= steps) clearInterval(anim);
        }, 50);
      } else {
        markers[bus_id].setLatLng(newLatLng);
      }

      lastPositions[bus_id] = location;
      lastCenter = newLatLng;

      // ONLY pan, no zoom reset
      if (autoCenter) {
        map.panTo(newLatLng);
      }
    });

  } catch (err) {
    console.log(err);
  }
}

// Run immediately + loop
update();
setInterval(update, 3000);