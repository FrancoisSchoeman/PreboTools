from django.db import models


class Conversion(models.Model):
    date = models.DateTimeField(auto_now_add=True)
    source = models.CharField(max_length=255, blank=True, default="")
    file_count = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.source or 'upload'} ({self.file_count} files)"
