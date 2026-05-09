const MAPTILER_KEY = window.MAPTILER_KEY;
let hoveredNoteId = null;

const map = new maplibregl.Map({
  container: "map",
  style: `https://api.maptiler.com/maps/basic-v2/style.json?key=${MAPTILER_KEY}`,
  center: [-1.4701, 53.3811],
  zoom: 12,
});

map.addControl(new maplibregl.NavigationControl(), "bottom-right");

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value || "";
  return div.innerHTML;
}

function makePopupHtml(properties) {
  const doorOpen =
    properties.door_left_open === true ||
    properties.door_left_open === "true";

  return `
    <article class="note-popup">
      <p class="note-category">
        ${escapeHtml(properties.category_display)}
      </p>

      <h2>${escapeHtml(properties.title)}</h2>

      <p>${escapeHtml(properties.body)}</p>

      ${
        properties.location_label
          ? `<p><strong>Near:</strong> ${escapeHtml(properties.location_label)}</p>`
          : ""
      }

      ${
        doorOpen
          ? `<p class="door-open">A gentle door was left open here.</p>`
          : ""
      }

      ${
        properties.reconnection_note
          ? `<p><em>${escapeHtml(properties.reconnection_note)}</em></p>`
          : ""
      }
    </article>
  `;
}

function layerExists(layerId) {
  return Boolean(map.getLayer(layerId));
}

function setPaintIfExists(layerId, property, value) {
  if (layerExists(layerId)) {
    map.setPaintProperty(layerId, property, value);
  }
}

function setLayoutIfExists(layerId, property, value) {
  if (layerExists(layerId)) {
    map.setLayoutProperty(layerId, property, value);
  }
}

function applySoftNightStyle() {
  // Background & residential color
  setPaintIfExists("Background", "background-color", "#000000");

  setPaintIfExists("Residential", "fill-color", "#000000");
  setPaintIfExists("Residential", "fill-opacity", 0.95);

  // Other land use colors
  setPaintIfExists("Forest", "fill-color", "#000000");
  setPaintIfExists("Grass", "fill-color", "#000000");
  setPaintIfExists("Wood", "fill-color", "#000000");
  setPaintIfExists("Sand", "fill-color", "#000000");

  // Water colors
  setPaintIfExists("Water", "fill-color", "#000000"); 
  setPaintIfExists("Water", "fill-opacity", 0.9);

  // River line colors
  setPaintIfExists("River", "line-color", "#1c00b8");
  setPaintIfExists("River", "line-opacity", 0.85);
  setPaintIfExists("River intermittent", "line-color", "#2e0092");
  setPaintIfExists("River intermittent", "line-opacity", 0.45);

  // Road colors
  setPaintIfExists("Road network", "line-color", "#ffffff");
  setPaintIfExists("Road network", "line-opacity", 0.32);

  // Foot Path colors
  setPaintIfExists("Path", "line-color", "#ffffff");
  setPaintIfExists("Path", "line-opacity", 0.25);

  setPaintIfExists("Path minor", "line-color", "#ffffff");
  setPaintIfExists("Path minor", "line-opacity", 0.18);

  // Railway colors
  setPaintIfExists("Railway", "line-color", "#9a9a9a");
  setPaintIfExists("Railway", "line-opacity", 0.25);

  // Transit colors
  setPaintIfExists("Transit", "line-color", "#adadad");
  setPaintIfExists("Transit", "line-opacity", 0.25);

  setPaintIfExists("Transit tunnel", "line-color", "#6f628a");
  setPaintIfExists("Transit tunnel", "line-opacity", 0.16);

  // Building colors
  setPaintIfExists("Building", "fill-color", "#ffffff");
  setPaintIfExists("Building", "fill-opacity", 0.38);

  // Road Label colors
  setPaintIfExists("Road labels", "text-color", "#a99abd");
  setPaintIfExists("Road labels", "text-halo-color", "#17131f");
  setPaintIfExists("Road labels", "text-halo-width", 1);

  // Station, place, city,  label colors
  setPaintIfExists("Station labels", "text-color", "#cbbde1");
  setPaintIfExists("Station labels", "text-halo-color", "#17131f");
  setPaintIfExists("Station labels", "text-halo-width", 1.2);

  setPaintIfExists("Place labels", "text-color", "#d8cde3");
  setPaintIfExists("Place labels", "text-halo-color", "#17131f");
  setPaintIfExists("Place labels", "text-halo-width", 1.3);

  setPaintIfExists("City labels", "text-color", "#fff8ef");
  setPaintIfExists("City labels", "text-halo-color", "#17131f");
  setPaintIfExists("City labels", "text-halo-width", 1.5);

  // Hide POI labels
  setLayoutIfExists("Airport labels", "visibility", "none");
}

function categoryColourExpression() {
  return [
    "match",
    ["get", "category"],
    "gratitude", "#f6b5d1",
    "recognition", "#9ad7ff",
    "almost_friend", "#c5a3ff",
    "hope_okay", "#b8f7d4",
    "door_open", "#fff0a8",
    "#ffffff",
  ];
}

function addCategoryFilters() {
  const buttons = document.querySelectorAll("[data-category]");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const category = button.dataset.category;

      buttons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      const filter =
        category === "all"
          ? null
          : ["==", ["get", "category"], category];

      [
        "note-soft-area",
        "note-glow",
        "note-core",
        "note-hover",
      ].forEach((layerId) => {
        if (map.getLayer(layerId)) {
          map.setFilter(layerId, filter);
        }
      });
    });
  });
}

function addRandomNoteButton() {
  const button = document.querySelector("#random-note-button");

  if (!button) return;

  button.addEventListener("click", () => {
    const features = map.querySourceFeatures("notes");

    if (!features.length) return;

    const randomFeature =
      features[Math.floor(Math.random() * features.length)];

    const coordinates = randomFeature.geometry.coordinates;
    const properties = randomFeature.properties;

    map.flyTo({
      center: coordinates,
      zoom: 15,
      duration: 1600,
      essential: false,
    });

    window.setTimeout(() => {
      new maplibregl.Popup({
        closeButton: true,
        closeOnClick: true,
        maxWidth: "340px",
      })
        .setLngLat(coordinates)
        .setHTML(makePopupHtml(properties))
        .addTo(map);
    }, 1600);
  });
}

map.on("load", () => {
  console.log(map.getStyle().layers.map((layer) => layer.id));

  applySoftNightStyle();

  map.addSource("notes", {
    type: "geojson",
    data: "/api/notes.geojson",
    promoteId: "id",
  });

  map.addLayer({
  id: "note-soft-area",
  type: "circle",
  source: "notes",
  paint: {
    "circle-radius": [
      "interpolate",
      ["linear"],
      ["zoom"],
      10, 16,
      14, 40,
      17, 90,
    ],
    "circle-blur": 1,
    "circle-opacity": 0.12,
    "circle-color": categoryColourExpression(),
  },
});

  map.addLayer({
    id: "note-glow",
    type: "circle",
    source: "notes",
    paint: {
      "circle-radius": 18,
      "circle-blur": 0.8,
      "circle-opacity": 0.7,
      "circle-color": categoryColourExpression(),
    },
  });

  
  map.addLayer({
  id: "note-hover",
  type: "circle",
  source: "notes",
  paint: {
    "circle-radius": 22,
    "circle-blur": 0.7,
    "circle-color": "#fff8ef",
    "circle-opacity": [
      "case",
      ["boolean", ["feature-state", "hover"], false],
      0.75,
      0,
    ],
  },
});

  map.addLayer({
    id: "note-core",
    type: "circle",
    source: "notes",
    paint: {
      "circle-radius": 5,
      "circle-color": categoryColourExpression(),
    },
  });

  map.on("click", "note-core", (event) => {
    const feature = event.features[0];
    const coordinates = feature.geometry.coordinates.slice();
    const properties = feature.properties;

    new maplibregl.Popup({
      closeButton: true,
      closeOnClick: true,
      maxWidth: "340px",
    })
      .setLngLat(coordinates)
      .setHTML(makePopupHtml(properties))
      .addTo(map);
  });


  map.on("mousemove", "note-core", (event) => {
    if (event.features.length > 0) {
      if (hoveredNoteId !== null) {
        map.setFeatureState(
          { source: "notes", id: hoveredNoteId },
          { hover: false }
        );
      }
    }

    hoveredNoteId = event.features[0].id;

    map.setFeatureState(
      { source: "notes", id: hoveredNoteId },
      { hover: true }
    );

    map.getCanvas().style.cursor = "pointer";
  });

map.on("mouseleave", "note-core", () => {
  if (hoveredNoteId !== null) {
    map.setFeatureState(
      { source: "notes", id: hoveredNoteId },
      { hover: false }
    );
  }

  hoveredNoteId = null;
  map.getCanvas().style.cursor = "";
});

  
  addCategoryFilters();

  addRandomNoteButton();
  
});

