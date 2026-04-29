const API = 'https://college-bus-tracking-system-zeam.onrender.com/buses';

const map = L.map('map').setView([12.9716, 77.5946], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
}).addTo(map);

const markers = {};
let autoCenter = true;

const busFilter = document.getElementById("bus-filter");

/* 🌙 THEME FIX */
const toggleBtn = document.getElementById("theme-toggle");

if(localStorage.getItem("theme") === "dark"){
  document.body.classList.add("dark");
}

toggleBtn.onclick = () => {
  document.body.classList.toggle("dark");

  localStorage.setItem(
    "theme",
    document.body.classList.contains("dark") ? "dark" : "light"
  );
};

/* CENTER */
document.getElementById('toggle-center').onclick = () => {
  autoCenter = !autoCenter;
};

/* UPDATE */
async function update() {
  try {
    const res = await fetch(API);
    const data = await res.json();
    const buses = data.buses || [];

    document.getElementById("active-buses-count").textContent = buses.length;

    const selected = busFilter.value || "all";

    /* Populate dropdown ONCE */
    if(busFilter.options.length <= 1){
      busFilter.innerHTML = '<option value="all">All Buses</option>';
      buses.forEach(b => {
        const o = document.createElement("option");
        o.value = b.bus_id;
        o.textContent = b.bus_id;
        busFilter.appendChild(o);
      });
    }

    buses.forEach(bus => {

      if(selected !== "all" && bus.bus_id !== selected){
        if(markers[bus.bus_id]){
          map.removeLayer(markers[bus.bus_id]);
        }
        return;
      }

      const {bus_id, location} = bus;

      if (!markers[bus_id]) {
        markers[bus_id] = L.marker([location.lat, location.lng])
          .addTo(map)
          .bindPopup(`<b>${bus_id}</b>`);   // ✅ LABEL
      } else {
        markers[bus_id].setLatLng([location.lat, location.lng]);
      }

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