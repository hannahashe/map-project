const MAPTILER_KEY = "replace-with-maptiler-key";

const map = new maplibregl.Map({
  container: "map",
  style: `https://api.maptiler.com/maps/basic-v2/style.json?key=${MAPTILER_KEY}`,
  center: [-1.4701, 53.3811],
  zoom: 12,
});

map.addControl(new maplibregl.NavigationControl(), "bottom-right");