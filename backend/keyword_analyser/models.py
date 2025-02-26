from django.db import models


class AnalysedKeyword(models.Model):
    date_created = models.DateTimeField(auto_now_add=True)
    date_modified = models.DateTimeField(auto_now=True)

    url = models.URLField()
    mapped_keyword = models.CharField(max_length=255)
    meta_title = models.CharField(max_length=255)
    meta_description = models.TextField(blank=True)
    new_title = models.CharField(max_length=255, blank=True)
    new_description = models.TextField(blank=True)
    user_intent_analysis = models.JSONField(blank=True, default=list)
    competitive_insights = models.JSONField(blank=True, default=list)
    seo_content_recommendations = models.JSONField(blank=True, default=list)
    content_and_blog_ideas = models.JSONField(blank=True, default=list)
    faq_creation_and_enhancements = models.JSONField(blank=True, default=list)

    class Meta:
        verbose_name = "Analysed Keyword"

    def __str__(self):
        return self.mapped_keyword
