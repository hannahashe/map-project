from django.contrib import admin
from .models import ConnectionNote


@admin.register(ConnectionNote)
class ConnectionNoteAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "category",
        "approximate_location_label",
        "door_left_open",
        "approved",
        "created_at",
    )
    list_filter = ("approved", "category", "door_left_open", "created_at")
    search_fields = ("title", "body", "approximate_location_label")
    list_editable = ("approved",)