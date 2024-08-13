from django.shortcuts import render
from django.contrib.auth.decorators import login_required


def home(request):
    return render(request, "main/home.html")


@login_required
def dashboard(request):
    return render(request, "main/dashboard.html")
