const map = L.map("map", {
  zoomControl: false,
}).setView([53.3811, -1.4701], 13);

L.control
  .zoom({
    position: "bottomright",
  })
  .addTo(map);

// Development tile layer.
// Fine for local testing, but use a provider like MapTiler before production.
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}

function makeIcon(category) {
  return L.divIcon({
    className: `memory-marker ${category}`,
    iconSize: [22, 22],
  });
}

fetch("/api/notes/")
  .then((response) => response.json())
  .then((data) => {
    data.notes.forEach((note) => {
      const marker = L.marker([note.lat, note.lng], {
        icon: makeIcon(note.category),
      });

      const popupContent = `
        <article class="note-popup">
          <p class="note-category">${escapeHtml(note.category_display)}</p>
          <h2>${escapeHtml(note.title)}</h2>
          <p>${escapeHtml(note.body)}</p>
          ${
            note.location_label
              ? `<p><strong>Near:</strong> ${escapeHtml(note.location_label)}</p>`
              : ""
          }
          ${
            note.door_left_open
              ? `<p class="door-open">A gentle door was left open here.</p>`
              : ""
          }
          ${
            note.reconnection_note
              ? `<p><em>${escapeHtml(note.reconnection_note)}</em></p>`
              : ""
          }
        </article>
      `;

      marker.addTo(map).bindPopup(popupContent);
    });
  });
