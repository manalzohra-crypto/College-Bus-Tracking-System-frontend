const API = "https://your-app.onrender.com/location";

var map;
var marker;

function initMap(){

map = new google.maps.Map(document.getElementById("map"),{
zoom:15,
center:{lat:0,lng:0}
});

marker = new google.maps.Marker({
position:{lat:0,lng:0},
map:map
});

}

function updateBus(){

fetch(API)
.then(res => res.json())
.then(data => {

var pos = {lat:data.lat, lng:data.lng};

marker.setPosition(pos);
map.setCenter(pos);

});

}

setInterval(updateBus,5000);