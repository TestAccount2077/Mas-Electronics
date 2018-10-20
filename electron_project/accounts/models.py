from django.db import models

from abstract.models import TimeStampedModel


class WorkerAccount(TimeStampedModel):
    
    username = models.CharField(max_length=300, unique=True)
    password = models.CharField(max_length=300, unique=True)
