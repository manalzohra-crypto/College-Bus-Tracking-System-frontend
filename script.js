const DEFAULT_API_HOST = 'https://college-bus-tracking-system-zeam.onrender.com';
const API_BASE = window.location.protocol.startsWith('http') ? window.location.origin : DEFAULT_API_HOST;
const API_BUSES = `${API_BASE}/buses`;
const API_LOCATION = `${API_BASE}/location`;

// Initialize map
const map = L.map('map').setView([0, 0], 15);

// Load OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors',
}).addTo(map);

// Track all bus markers
const busMarkers = {};
const busColors = {
  'Bus-1': '#e74c3c',
  'Bus-2': '#3498db',
  'Bus-3': '#2ecc71',
  'Bus-4': '#f39c12',
  'Bus-5': '#9b59b6',
};

let trackedBus = 'all';
let allBuses = [];
const lastUpdateEl = document.getElementById('last-update');
const activeBusesEl = document.getElementById('active-buses-count');
const trackedBusEl = document.getElementById('tracked-bus');
const busesListEl = document.getElementById('buses-list');
const busFilterEl = document.getElementById('bus-filter');
const toggleCenterBtn = document.getElementById('toggle-center');

// Auto-center control
let autoCenter = true;

if (toggleCenterBtn) {
  toggleCenterBtn.addEventListener('click', function () {
    autoCenter = !autoCenter;
    toggleCenterBtn.textContent = autoCenter ? 'Center map' : 'Free roam';
    toggleCenterBtn.classList.toggle('active', autoCenter);
  });
}

// Bus filter change
if (busFilterEl) {
  busFilterEl.addEventListener('change', function () {
    trackedBus = this.value;
    if (trackedBusEl) {
      trackedBusEl.textContent = trackedBus === 'all' ? 'All buses' : trackedBus;
    }
  });
}

// Disable auto-centering when user interacts
map.on('dragstart zoomstart', function () {
  autoCenter = false;
  if (toggleCenterBtn) {
    toggleCenterBtn.textContent = 'Free roam';
    toggleCenterBtn.classList.remove('active');
  }
});

function getMarkerColor(busId) {
  return busColors[busId] || '#BB7154';
}

function createBusMarker(busId, lat, lng) {
  const color = getMarkerColor(busId);
  const html = `<div style="background-color: ${color}; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px;">${busId.slice(0, 2).toUpperCase()}</div>`;
  const icon = L.divIcon({
    html: html,
    iconSize: [30, 30],
    className: 'bus-marker',
  });
  return L.marker([lat, lng], { icon: icon });
}

function updateBusMarker(busId, lat, lng) {
  if (busMarkers[busId]) {
    busMarkers[busId].setLatLng([lat, lng]);
  } else {
    busMarkers[busId] = createBusMarker(busId, lat, lng).addTo(map);
  }

  // Auto-center on tracked bus
  if (autoCenter && (trackedBus === 'all' || trackedBus === busId)) {
    map.panTo([lat, lng]);
  }
}

function updateBusesList(buses) {
  if (!busesListEl) return;

  if (buses.length === 0) {
    busesListEl.innerHTML = '<p class="empty-state">No buses active</p>';
    return;
  }

  let html = '<div class="buses-grid">';
  buses.forEach(bus => {
    const { bus_id, location } = bus;
    const color = getMarkerColor(bus_id);
    html += `
      <div class="bus-item" style="border-left: 4px solid ${color};">
        <strong>${bus_id}</strong><br>
        <small>Lat ${location.lat.toFixed(4)}<br>Lng ${location.lng.toFixed(4)}</small>
      </div>
    `;
  });
  html += '</div>';
  busesListEl.innerHTML = html;
}

function updateTimestamp() {
  if (!lastUpdateEl) return;
  const now = new Date();
  lastUpdateEl.textContent = now.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

// Fetch and update all buses
async function updateBuses() {
  try {
    const res = await fetch(API_BUSES, { cache: 'no-store' });
    if (!res.ok) {
      console.error('Failed to fetch buses:', res.status);
      return;
    }

    const data = await res.json();
    const buses = data.buses || [];
    allBuses = buses;

    // Update markers
    buses.forEach(bus => {
      const { bus_id, location } = bus;
      if (location.lat && location.lng) {
        updateBusMarker(bus_id, location.lat, location.lng);
      }
    });

    // Update UI
    if (activeBusesEl) {
      activeBusesEl.textContent = buses.length;
    }

    // Update bus list
    updateBusesList(buses);

    // Update filter dropdown
    const currentOptions = Array.from(busFilterEl.options).map(o => o.value);
    buses.forEach(bus => {
      if (!currentOptions.includes(bus.bus_id)) {
        const option = document.createElement('option');
        option.value = bus.bus_id;
        option.textContent = bus.bus_id;
        busFilterEl.appendChild(option);
      }
    });

    updateTimestamp();
  } catch (err) {
    console.error('Error updating buses:', err);
  }
}

// Run immediately + repeat every 2 seconds
updateBuses();
setInterval(updateBuses, 2000);