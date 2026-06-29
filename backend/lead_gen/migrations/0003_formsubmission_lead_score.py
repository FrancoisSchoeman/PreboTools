from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("lead_gen", "0002_activitylog_client_last_csv_export_at_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="formsubmission",
            name="lead_score",
            field=models.CharField(
                choices=[
                    ("not_set", "Not set"),
                    ("cold", "Cold"),
                    ("warm", "Warm"),
                    ("hot", "Hot"),
                ],
                default="not_set",
                max_length=16,
            ),
        ),
    ]
