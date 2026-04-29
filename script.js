let lastUpdate = 0;

async function update() {
  try {
    const now = Date.now();

    /* reduce excessive fetch */
    if(now - lastUpdate < 2500) return;
    lastUpdate = now;

    const res = await fetch(API);
    const data = await res.json();
    const buses = data.buses || [];

    document.getElementById("active-buses-count").textContent = buses.length;

    const selected = busFilter.value || "all";

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
          .bindPopup(`<b>${bus_id}</b>`);
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