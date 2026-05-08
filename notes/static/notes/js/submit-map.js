const submitMap = L.map("submit-map", {
  zoomControl: false,
}).setView([53.3811, -1.4701], 13);

L.control
  .zoom({
    position: "bottomright",
  })
  .addTo(submitMap);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(submitMap);

const latInput = document.querySelector("#id_latitude");
const lngInput = document.querySelector("#id_longitude");

let selectedMarker = null;

function softenCoordinate(value) {
  // Rounds to ~100m-ish rather than hyper-exact.
  // You can make this softer later.
  return Number(value).toFixed(3);
}

submitMap.on("click", (event) => {
  const lat = softenCoordinate(event.latlng.lat);
  const lng = softenCoordinate(event.latlng.lng);

  latInput.value = lat;
  lngInput.value = lng;

  if (selectedMarker) {
    selectedMarker.setLatLng([lat, lng]);
  } else {
    selectedMarker = L.marker([lat, lng]).addTo(submitMap);
  }
});
