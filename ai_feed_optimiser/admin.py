from django.contrib import admin
from .models import Feed, FeedResults


# Register your models here.
class FeedAdmin(admin.ModelAdmin):
    list_display = [field.name for field in Feed._meta.fields]


class FeedResultsAdmin(admin.ModelAdmin):
    list_display = [field.name for field in FeedResults._meta.fields]


admin.site.register(Feed, FeedAdmin)
admin.site.register(FeedResults, FeedResultsAdmin)
