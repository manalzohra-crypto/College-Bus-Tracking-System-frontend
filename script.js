const API = "https://your-render-url.onrender.com/buses";

let map = L.map("map").setView([0,0],15);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

let markers = {};
let lastPositions = {};
let autoCenter = true;

async function update(){

  let res = await fetch(API);
  let data = await res.json();

  data.buses.forEach(bus => {

    let {bus_id, location} = bus;

    if(!markers[bus_id]){
      markers[bus_id] = L.marker([location.lat,location.lng]).addTo(map);
      map.setView([location.lat,location.lng],15);
    }

    // Smooth movement
    let prev = lastPositions[bus_id];
    if(prev){
      let steps = 10;
      let latStep = (location.lat - prev.lat)/steps;
      let lngStep = (location.lng - prev.lng)/steps;

      let i=0;
      let interval = setInterval(()=>{
        i++;
        let newLat = prev.lat + latStep*i;
        let newLng = prev.lng + lngStep*i;
        markers[bus_id].setLatLng([newLat,newLng]);
        if(i>=steps) clearInterval(interval);
      },50);
    }

    lastPositions[bus_id] = location;

    if(autoCenter){
      map.panTo([location.lat,location.lng]);
    }

  });

}

setInterval(update,2000);

document.getElementById("center-btn").onclick = ()=>{
  autoCenter = true;
};

document.getElementById("dark-btn").onclick = ()=>{
  document.body.classList.toggle("dark");
};