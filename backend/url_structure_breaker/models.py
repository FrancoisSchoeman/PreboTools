from django.db import models


class Conversion(models.Model):
    date = models.DateTimeField(auto_now_add=True)
    source = models.CharField(max_length=255, blank=True, default="")
    row_count = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.source or 'upload'} ({self.row_count} rows)"
