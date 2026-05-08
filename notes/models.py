from django.db import models
from django.urls import reverse


class ConnectionNote(models.Model):
    class Category(models.TextChoices):
        GRATITUDE = "gratitude", "Unsent gratitude"
        RECOGNITION = "recognition", "Moment of recognition"
        ALMOST_FRIEND = "almost_friend", "Almost friend"
        HOPE_OKAY = "hope_okay", "I hope you're okay"
        DOOR_OPEN = "door_open", "A door left open"

    title = models.CharField(max_length=120)
    body = models.TextField(max_length=1000)
    category = models.CharField(
        max_length=40,
        choices=Category.choices,
    )

    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)

    approximate_location_label = models.CharField(
        max_length=120,
        blank=True,
        help_text="Example: near the station, outside the library, Kelham Island",
    )

    door_left_open = models.BooleanField(default=False)
    reconnection_note = models.TextField(
        max_length=500,
        blank=True,
        help_text="Optional. A gentle note only, not identifying information.",
    )

    approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title

    def get_absolute_url(self):
        return reverse("notes:thanks")