from django import forms
from .models import ConnectionNote


class ConnectionNoteForm(forms.ModelForm):
    safety_agreement = forms.BooleanField(
        required=True,
        label=(
            "I have avoided full names, exact addresses, workplaces, "
            "or identifying details."
        ),
    )

    class Meta:
        model = ConnectionNote
        fields = [
            "title",
            "body",
            "category",
            "approximate_location_label",
            "latitude",
            "longitude",
            "door_left_open",
            "reconnection_note",
        ]
        widgets = {
            "body": forms.Textarea(attrs={"rows": 5}),
            "reconnection_note": forms.Textarea(attrs={"rows": 3}),
            "latitude": forms.HiddenInput(),
            "longitude": forms.HiddenInput(),
        }

    def clean_body(self):
        body = self.cleaned_data["body"]

        risky_words = ["full address", "phone number", "email me at"]

        for word in risky_words:
            if word.lower() in body.lower():
                raise forms.ValidationError(
                    "Please remove identifying or contact details."
                )

        return body