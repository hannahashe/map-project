from django.urls import path
from . import views

app_name = "notes"

urlpatterns = [
    path("", views.HomeView.as_view(), name="home"),
    path("submit/", views.ConnectionNoteCreateView.as_view(), name="submit"),
    path("thanks/", views.ThanksView.as_view(), name="thanks"),
    path("api/notes.geojson", views.approved_notes_geojson, name="approved_notes_geojson"),
]