from django.urls import path
from . import views

app_name = "image_resizer"

urlpatterns = [
    path("", views.resize_image, name="resize_image"),
]
