# Generated by Django 5.0.7 on 2024-08-30 10:29

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ai_feed_optimiser', '0004_feedresults_identifier_exists'),
    ]

    operations = [
        migrations.AddField(
            model_name='feedresults',
            name='custom_attributes',
            field=models.JSONField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='feed',
            name='feed_type',
            field=models.CharField(choices=[('wordpress', 'WordPress'), ('shopify', 'Shopify'), ('other', 'Other')], max_length=50),
        ),
    ]
