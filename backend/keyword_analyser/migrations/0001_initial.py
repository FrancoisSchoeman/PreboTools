# Generated by Django 5.1.6 on 2025-02-21 21:16

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='AnalysedKeyword',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date_created', models.DateTimeField(auto_now_add=True)),
                ('date_modified', models.DateTimeField(auto_now=True)),
                ('url', models.URLField()),
                ('mapped_keyword', models.CharField(max_length=255)),
                ('meta_title', models.CharField(max_length=255)),
                ('meta_description', models.TextField(blank=True)),
                ('new_title', models.CharField(blank=True, max_length=255)),
                ('new_description', models.TextField(blank=True)),
                ('user_intent_analysis', models.JSONField(blank=True, default=list)),
                ('competitive_insights', models.JSONField(blank=True, default=list)),
                ('seo_content_recommendations', models.JSONField(blank=True, default=list)),
                ('content_and_blog_ideas', models.JSONField(blank=True, default=list)),
                ('faq_creation_and_enhancements', models.JSONField(blank=True, default=list)),
            ],
        ),
    ]
