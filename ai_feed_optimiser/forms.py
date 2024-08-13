from django import forms
from .models import Feed


class FeedForm(forms.ModelForm):
    class Meta:
        model = Feed
        fields = ["name", "url", "feed_type", "file_format"]
