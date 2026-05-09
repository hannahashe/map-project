from django.http import JsonResponse
from django.urls import reverse_lazy
from django.views.generic import CreateView, TemplateView

from .forms import ConnectionNoteForm
from .models import ConnectionNote



class HomeView(TemplateView):
    template_name = "notes/home.html"


class ThanksView(TemplateView):
    template_name = "notes/thanks.html"


class ConnectionNoteCreateView(CreateView):
    model = ConnectionNote
    form_class = ConnectionNoteForm
    template_name = "notes/submit_note.html"
    success_url = reverse_lazy("notes:thanks")

    def form_valid(self, form):
        form.instance.approved = False
        return super().form_valid(form)


def approved_notes_json(request):
    notes = ConnectionNote.objects.filter(approved=True)

    data = [
        {
            "title": note.title,
            "body": note.body,
            "category": note.category,
            "category_display": note.get_category_display(),
            "lat": float(note.latitude),
            "lng": float(note.longitude),
            "door_left_open": note.door_left_open,
            "reconnection_note": note.reconnection_note,
            "location_label": note.approximate_location_label,
        }
        for note in notes
    ]

    return JsonResponse({"notes": data})

def approved_notes_geojson(request):
    notes = ConnectionNote.objects.filter(approved=True)

    features = []

    for note in notes:
        features.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [
                    float(note.longitude),
                    float(note.latitude),
                ],
            },
            "properties": {
                "id": note.id,
                "title": note.title,
                "body": note.body,
                "category": note.category,
                "category_display": note.get_category_display(),
                "door_left_open": note.door_left_open,
                "reconnection_note": note.reconnection_note,
                "location_label": note.approximate_location_label,
            },
        })

    return JsonResponse({
        "type": "FeatureCollection",
        "features": features,
    })