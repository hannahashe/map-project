const MAPTILER_KEY = window.MAPTILER_KEY;
let hoveredNoteId = null;
let isSubmittingNote = false;
let selectedSubmitMarker = null;

const map = new maplibregl.Map({
  container: "map",
  style: `https://api.maptiler.com/maps/basic-v2/style.json?key=${MAPTILER_KEY}`,
  center: [-1.4701, 53.3811],
  zoom: 12,
});

map.addControl(new maplibregl.NavigationControl(), "bottom-left");

const latInput = document.querySelector("#id_latitude");
const lngInput = document.querySelector("#id_longitude");
const submitModal = document.querySelector("#submit-modal");
const openSubmitButton = document.querySelector("#open-submit-modal");
const closeSubmitButton = document.querySelector("#close-submit-modal");
const locationStatus = document.querySelector("#location-status");

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value || "";
  return div.innerHTML;
}

// Pop up HTML generation with proper escaping and conditional sections

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

// Softening coordinates to encourage approximate placements and protect privacy

function softenCoordinate(value) {
  return Number(value).toFixed(3);
}

// Submit modal handling with map interaction for note placement

function openSubmitModal() {
  if (!submitModal) return;

  submitModal.hidden = false;
  isSubmittingNote = true;

  if (locationStatus) {
    locationStatus.textContent =
      "Click the map to place this note nearby, not exactly.";
  }
}

function closeSubmitModal() {
  if (!submitModal) return;

  submitModal.hidden = true;
  isSubmittingNote = false;

  if (selectedSubmitMarker) {
    selectedSubmitMarker.remove();
    selectedSubmitMarker = null;
  }

  if (latInput) latInput.value = "";
  if (lngInput) lngInput.value = "";
}

if (openSubmitButton) {
  openSubmitButton.addEventListener("click", openSubmitModal);
}

if (closeSubmitButton) {
  closeSubmitButton.addEventListener("click", closeSubmitModal);
}

// Map click handling for note placement during submission

map.on("click", (event) => {
  if (!isSubmittingNote) return;

  const lng = softenCoordinate(event.lngLat.lng);
  const lat = softenCoordinate(event.lngLat.lat);

  if (latInput) latInput.value = lat;
  if (lngInput) lngInput.value = lng;

  if (locationStatus) {
    locationStatus.textContent =
      "Location added. Click elsewhere to move it.";
  }

  if (selectedSubmitMarker) {
    selectedSubmitMarker.setLngLat([lng, lat]);
  } else {
    const markerElement = document.createElement("div");
    markerElement.className = "selected-submit-marker";

    selectedSubmitMarker = new maplibregl.Marker({
      element: markerElement,
    })
      .setLngLat([lng, lat])
      .addTo(map);
  }
});

// Map custom styling adjustments for a softer, night-themed aesthetic

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

// SoftNightStyle custom map adjustments based on MapTiler's Basic style layers

function applySoftNightStyle() {
  // Background & residential color
  setPaintIfExists("Background", "background-color", "#1D1624");

  setPaintIfExists("Residential", "fill-color", "#4F2D48");
  setPaintIfExists("Residential", "fill-opacity", 0.95);

  // Other land use colors
  setPaintIfExists("Forest", "fill-color", "#1D1624");
  setPaintIfExists("Grass", "fill-color", "#1D1624");
  setPaintIfExists("Wood", "fill-color", "#1D1624");
  setPaintIfExists("Sand", "fill-color", "#1D1624");

  // Water colors
  setPaintIfExists("Water", "fill-color", "#3B325C"); 
  setPaintIfExists("Water", "fill-opacity", 0.9);

  // River line colors
  setPaintIfExists("River", "line-color", "#3B325C");
  setPaintIfExists("River", "line-opacity", 0.85);
  setPaintIfExists("River intermittent", "line-color", "#3B325C");
  setPaintIfExists("River intermittent", "line-opacity", 0.45);

  // Road colors
  setPaintIfExists("Road network", "line-color", "#865F71");
  setPaintIfExists("Road network", "line-opacity", 0.32);

  // Foot Path colors
  setPaintIfExists("Path", "line-color", "#C67F98");
  setPaintIfExists("Path", "line-opacity", 0.25);

  setPaintIfExists("Path minor", "line-color", "#C67F98");
  setPaintIfExists("Path minor", "line-opacity", 0.18);

  // Railway colors
  setPaintIfExists("Railway", "line-color", "#865F71");
  setPaintIfExists("Railway", "line-opacity", 0.25);

  // Transit colors
  setPaintIfExists("Transit", "line-color", "#865F71");
  setPaintIfExists("Transit", "line-opacity", 0.25);

  setPaintIfExists("Transit tunnel", "line-color", "#865F71");
  setPaintIfExists("Transit tunnel", "line-opacity", 0.16);

  // Building colors
  setPaintIfExists("Building", "fill-color", "#4F2D48");
  setPaintIfExists("Building", "fill-opacity", 0.38);

  // Road Label colors
  setPaintIfExists("Road labels", "text-color", "#C67F98");
  setPaintIfExists("Road labels", "text-halo-color", "#C67F98");
  setPaintIfExists("Road labels", "text-halo-width", 1);

  // Station, place, city,  label colors
  setPaintIfExists("Station labels", "text-color", "#fff8f0");
  setPaintIfExists("Station labels", "text-halo-color", "#4F2D48");
  setPaintIfExists("Station labels", "text-halo-width", 1.2);

  setPaintIfExists("Place labels", "text-color", "#fff8f0");
  setPaintIfExists("Place labels", "text-halo-color", "#4F2D48");
  setPaintIfExists("Place labels", "text-halo-width", 1.3);

  setPaintIfExists("City labels", "text-color", "#fff8f0");
  setPaintIfExists("City labels", "text-halo-color", "#4F2D48");
  setPaintIfExists("City labels", "text-halo-width", 1.5);

  // Label sizing
  setLayoutIfExists("Place labels", "text-size", 18);
  setLayoutIfExists("City labels", "text-size", 23);
  setLayoutIfExists("Station labels", "text-size", 13);
  setLayoutIfExists("Road labels", "text-size", 11);

  // Hide POI labels
  setLayoutIfExists("Airport labels", "visibility", "none");
}

// Category-based coloring expression for note layers

function categoryColourExpression() {
  return [
    "match",
    ["get", "category"],
    "gratitude", "#ffffff",
    "recognition", "#9ad7ff",
    "almost_friend", "#ffffff",
    "hope_okay", "#ffffff",
    "door_open", "#ffffff",
    "#ffffff",
  ];
}

// Category filter button handling to show/hide notes by category

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
        "note-icon",
      ].forEach((layerId) => {
        if (map.getLayer(layerId)) {
          map.setFilter(layerId, filter);
        }
      });
    });
  });
}


// Random note button handling to fly to a random note and open its popup

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

// Function to create a custom note icon image using canvas, which can be used for future marker implementations

function createNoteIconImage() {
  const size = 64;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  canvas.width = size;
  canvas.height = size;

  const cx = size / 2;
  const cy = size / 2;

  // Glow
  const gradient = context.createRadialGradient(cx, cy, 4, cx, cy, 30);
  gradient.addColorStop(0, "rgba(157, 163, 214, 1)");
  gradient.addColorStop(0.35, "rgba(157, 163, 214, 0.8)");
  gradient.addColorStop(1, "rgba(157, 163, 214, 0)");

  context.fillStyle = gradient;
  context.beginPath();
  context.arc(cx, cy, 30, 0, Math.PI * 2);
  context.fill();

  context.strokeStyle = "#d8cde3";
  context.lineWidth = 4.5;
  context.lineCap = "round";

  // Slightly irregular spark arms
  context.beginPath();
  context.moveTo(cx, cy - 20);
  context.lineTo(cx, cy + 20);
  context.stroke();

  context.beginPath();
  context.moveTo(cx - 13, cy + 1);
  context.lineTo(cx + 15, cy - 1);
  context.stroke();

  context.beginPath();
  context.moveTo(cx - 8, cy - 10);
  context.lineTo(cx + 10, cy + 8);
  context.stroke();

  context.beginPath();
  context.moveTo(cx + 10, cy - 8);
  context.lineTo(cx - 8, cy + 10);
  context.stroke();

  context.fillStyle = "#d8cde3";
  context.beginPath();
  context.arc(cx, cy, 3.5, 0, Math.PI * 2);
  context.fill();

  return context.getImageData(0, 0, size, size);
}

// Map load event to set up sources, layers, styles, and interactions

map.on("load", () => {
  console.log(map.getStyle().layers.map((layer) => layer.id));
// Apply custom soft night style adjustments to the base map for a cohesive aesthetic with the note markers and popups
  applySoftNightStyle();

// Add custom note icon image to the map style for future use

    if (!map.hasImage("note-icon-image")) {
    map.addImage("note-icon-image", createNoteIconImage(), {
      pixelRatio: 2,
    });
  }

  // Notes source from json 

  map.addSource("notes", {
    type: "geojson",
    data: "/api/notes.geojson",
    promoteId: "id",
  });

  // Layer order: soft glow, hover effect, then core circle for crispness and interactivity

  // Soft glow layer with category-based coloring and dynamic sizing based on zoom level

  // SOFT AREA LAYER
  // map.addLayer({
  // id: "note-soft-area",
  // type: "circle",
  // source: "notes",
  // paint: {
  //   "circle-radius": [
  //     "interpolate",
  //     ["linear"],
  //     ["zoom"],
  //     10, 16,
  //     14, 40,
  //     17, 90,
  //   ],
  //   "circle-blur": 1,
  //   "circle-opacity": 0.12,
  //   "circle-color": categoryColourExpression(),
  //   },
  // });

// GLOW LAYER
  // map.addLayer({
  //   id: "note-glow",
  //   type: "circle",
  //   source: "notes",
  //   paint: {
  //     "circle-radius": 18,
  //     "circle-blur": 0.8,
  //     "circle-opacity": 0.7,
  //     "circle-color": categoryColourExpression(),
  //   },
  // });

// ICON LAYER 
map.addLayer({
  id: "note-icon",
  type: "symbol",
  source: "notes",
  layout: {
    "icon-image": "note-icon-image",
    "icon-size": [
      "interpolate",
      ["linear"],
      ["zoom"],
      10, 1.0,
      14, 1.35,
      17, 1.7,
    ],
    "icon-allow-overlap": true,
    "icon-ignore-placement": true,
  },
});

  
//   map.addLayer({
//   id: "note-hover",
//   type: "circle",
//   source: "notes",
//   paint: {
//     "circle-radius": 22,
//     "circle-blur": 0.7,
//     "circle-color": "#fff8ef",
//     "circle-opacity": [
//       "case",
//       ["boolean", ["feature-state", "hover"], false],
//       0.75,
//       0,
//     ],
//   },
// });

  // map.addLayer({
  //   id: "note-core",
  //   type: "circle",
  //   source: "notes",
  //   paint: {
  //     "circle-radius": 5,
  //     "circle-color": categoryColourExpression(),
  //   },
  // });

  map.on("click", "note-icon", (event) => {
    if (isSubmittingNote) return;

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


  map.on("mousemove", "note-icon", (event) => {
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

map.on("mouseleave", "note-icon", () => {
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

