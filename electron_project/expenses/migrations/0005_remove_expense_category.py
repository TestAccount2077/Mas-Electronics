# -*- coding: utf-8 -*-
# Generated by Django 1.11.2 on 2018-11-14 12:12
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('expenses', '0004_auto_20181114_1410'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='expense',
            name='category',
        ),
    ]
