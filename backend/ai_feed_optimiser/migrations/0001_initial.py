# Generated by Django 5.1.6 on 2025-02-15 18:27

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Feed',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date_created', models.DateTimeField(auto_now_add=True)),
                ('date_modified', models.DateTimeField(auto_now=True)),
                ('name', models.CharField(max_length=255, unique=True)),
                ('url', models.URLField(blank=True, null=True)),
                ('feed_type', models.CharField(choices=[('wordpress', 'WordPress'), ('shopify', 'Shopify'), ('other', 'Other')], max_length=50)),
                ('file_format', models.CharField(choices=[('csv', 'CSV'), ('xml', 'XML')], max_length=3)),
            ],
        ),
        migrations.CreateModel(
            name='FeedResults',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('product_id', models.CharField(max_length=255)),
                ('title', models.CharField(max_length=255)),
                ('description', models.TextField(blank=True)),
                ('link', models.URLField()),
                ('image_link', models.URLField()),
                ('availability', models.CharField(max_length=50)),
                ('price', models.CharField(max_length=255)),
                ('color', models.CharField(blank=True, max_length=50)),
                ('product_type', models.CharField(blank=True, max_length=255)),
                ('brand', models.CharField(blank=True, max_length=255)),
                ('identifier_exists', models.CharField(blank=True, max_length=50)),
                ('material', models.CharField(blank=True, max_length=255)),
                ('condition', models.CharField(blank=True, max_length=50)),
                ('size', models.CharField(blank=True, max_length=255)),
                ('custom_attributes', models.JSONField(blank=True, null=True)),
                ('feed', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='results', to='ai_feed_optimiser.feed')),
            ],
            options={
                'verbose_name_plural': 'Feed Results',
            },
        ),
    ]
