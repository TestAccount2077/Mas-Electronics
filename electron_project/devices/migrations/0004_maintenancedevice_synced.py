# -*- coding: utf-8 -*-
# Generated by Django 1.11.2 on 2018-10-20 05:33
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('devices', '0003_auto_20180923_0557'),
    ]

    operations = [
        migrations.AddField(
            model_name='maintenancedevice',
            name='synced',
            field=models.BooleanField(default=False),
        ),
    ]
