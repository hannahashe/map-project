const MAPTILER_KEY = window.MAPTILER_KEY;

const submitMap = new maplibregl.Map({
  container: "submit-map",
  style: `https://api.maptiler.com/maps/basic-v2/style.json?key=${MAPTILER_KEY}`,
  center: [-1.4701, 53.3811],
  zoom: 12,
});

submitMap.addControl(new maplibregl.NavigationControl(), "bottom-right");

const latInput = document.querySelector("#id_latitude");
const lngInput = document.querySelector("#id_longitude");

let selectedMarker = null;

function softenCoordinate(value) {
  return Number(value).toFixed(3);
}

submitMap.on("load", () => {
  applySubmitSoftNightStyle();
});

submitMap.on("click", (event) => {
  const lng = softenCoordinate(event.lngLat.lng);
  const lat = softenCoordinate(event.lngLat.lat);

  latInput.value = lat;
  lngInput.value = lng;

  if (selectedMarker) {
    selectedMarker.setLngLat([lng, lat]);
  } else {
    const markerElement = document.createElement("div");
    markerElement.className = "selected-submit-marker";

    selectedMarker = new maplibregl.Marker({
      element: markerElement,
    })
      .setLngLat([lng, lat])
      .addTo(submitMap);
  }
});

function submitLayerExists(layerId) {
  return Boolean(submitMap.getLayer(layerId));
}

function setSubmitPaintIfExists(layerId, property, value) {
  if (submitLayerExists(layerId)) {
    submitMap.setPaintProperty(layerId, property, value);
  }
}

function setSubmitLayoutIfExists(layerId, property, value) {
  if (submitLayerExists(layerId)) {
    submitMap.setLayoutProperty(layerId, property, value);
  }
}

function applySubmitSoftNightStyle() {
  setSubmitPaintIfExists("Background", "background-color", "#17131f");

  setSubmitPaintIfExists("Residential", "fill-color", "#1b1624");
  setSubmitPaintIfExists("Residential", "fill-opacity", 0.95);

  setSubmitPaintIfExists("Forest", "fill-color", "#1e2a28");
  setSubmitPaintIfExists("Grass", "fill-color", "#202b2a");
  setSubmitPaintIfExists("Wood", "fill-color", "#1d2927");
  setSubmitPaintIfExists("Sand", "fill-color", "#2b2430");

  setSubmitPaintIfExists("Water", "fill-color", "#21182f");
  setSubmitPaintIfExists("Water", "fill-opacity", 0.9);

  setSubmitPaintIfExists("River", "line-color", "#3b3150");
  setSubmitPaintIfExists("River", "line-opacity", 0.85);

  setSubmitPaintIfExists("River intermittent", "line-color", "#3b3150");
  setSubmitPaintIfExists("River intermittent", "line-opacity", 0.45);

  setSubmitPaintIfExists("Road network", "line-color", "#6f628a");
  setSubmitPaintIfExists("Road network", "line-opacity", 0.32);

  setSubmitPaintIfExists("Path", "line-color", "#8b7ca4");
  setSubmitPaintIfExists("Path", "line-opacity", 0.25);

  setSubmitPaintIfExists("Path minor", "line-color", "#8b7ca4");
  setSubmitPaintIfExists("Path minor", "line-opacity", 0.18);

  setSubmitPaintIfExists("Railway", "line-color", "#8f83a8");
  setSubmitPaintIfExists("Railway", "line-opacity", 0.25);

  setSubmitPaintIfExists("Transit", "line-color", "#8f83a8");
  setSubmitPaintIfExists("Transit", "line-opacity", 0.25);

  setSubmitPaintIfExists("Transit tunnel", "line-color", "#6f628a");
  setSubmitPaintIfExists("Transit tunnel", "line-opacity", 0.16);

  setSubmitPaintIfExists("Building", "fill-color", "#261f31");
  setSubmitPaintIfExists("Building", "fill-opacity", 0.38);

  setSubmitPaintIfExists("Road labels", "text-color", "#a99abd");
  setSubmitPaintIfExists("Road labels", "text-halo-color", "#17131f");
  setSubmitPaintIfExists("Road labels", "text-halo-width", 1);

  setSubmitPaintIfExists("Station labels", "text-color", "#cbbde1");
  setSubmitPaintIfExists("Station labels", "text-halo-color", "#17131f");
  setSubmitPaintIfExists("Station labels", "text-halo-width", 1.2);

  setSubmitPaintIfExists("Place labels", "text-color", "#d8cde3");
  setSubmitPaintIfExists("Place labels", "text-halo-color", "#17131f");
  setSubmitPaintIfExists("Place labels", "text-halo-width", 1.3);

  setSubmitPaintIfExists("City labels", "text-color", "#fff8ef");
  setSubmitPaintIfExists("City labels", "text-halo-color", "#17131f");
  setSubmitPaintIfExists("City labels", "text-halo-width", 1.5);

  setSubmitLayoutIfExists("Airport labels", "visibility", "none");
}