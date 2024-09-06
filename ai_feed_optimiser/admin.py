from django.contrib import admin
from .models import Feed, FeedResults


# Register your models here.
class FeedResultsInline(admin.TabularInline):
    model = FeedResults
    extra = 0


class FeedAdmin(admin.ModelAdmin):
    list_display = [field.name for field in Feed._meta.fields]

    list_filter = ["date_created", "date_modified", "feed_type", "file_format"]

    search_fields = ["name", "feed_type", "file_format"]

    inlines = [FeedResultsInline]


admin.site.register(Feed, FeedAdmin)
