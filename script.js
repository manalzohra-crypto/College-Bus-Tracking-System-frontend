const API = 'https://college-bus-tracking-system-zeam.onrender.com/buses';

const map = L.map('map').setView([12.9716, 77.5946], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
}).addTo(map);

const markers = {};
let autoCenter = true;

const busFilter = document.getElementById("bus-filter");

/* THEME */
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

    /* dropdown */
    busFilter.innerHTML = '<option value="all">All Buses</option>';
    buses.forEach(bus => {
      const opt = document.createElement("option");
      opt.value = bus.bus_id;
      opt.textContent = bus.bus_id;
      busFilter.appendChild(opt);
    });
    busFilter.value = selected;

    /* clear old markers */
    Object.values(markers).forEach(m => map.removeLayer(m));
    Object.keys(markers).forEach(k => delete markers[k]);

    /* draw */
    buses.forEach(bus => {

      if(selected !== "all" && bus.bus_id !== selected) return;

      const marker = L.marker([bus.location.lat, bus.location.lng])
        .addTo(map)
        .bindPopup(`<b>${bus.bus_id}</b>`);

      markers[bus.bus_id] = marker;

      if(autoCenter){
        map.setView([bus.location.lat, bus.location.lng], 15);
      }
    });

  } catch (e) {
    console.error(e);
  }
}

setInterval(update, 3000);
update();