const API = "https://college-bus-tracking-system-zeam.onrender.com/location";

var map = L.map('map').setView([0, 0], 15);

// Load OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

var marker = L.marker([0, 0]).addTo(map);

function updateBus(){

fetch(API)
.then(res => res.json())
.then(data => {

var lat = data.lat;
var lng = data.lng;

marker.setLatLng([lat, lng]);
map.setView([lat, lng]);

});

}

setInterval(updateBus, 5000);