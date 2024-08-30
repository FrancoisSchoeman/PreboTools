from django import forms
from .models import Feed


class FeedForm(forms.ModelForm):
    class Meta:
        model = Feed
        fields = ["name", "url", "feed_type", "file_format"]


class UploadFileForm(forms.Form):
    feed_name = forms.CharField(max_length=255)
    file_input = forms.FileField()
