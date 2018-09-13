from django.db import models
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.conf import settings

import pendulum


from abstract.models import TimeStampedModel, App


tz = pendulum.timezone(settings.TIME_ZONE)


class Attendance(TimeStampedModel):
    
    name = models.CharField(max_length=100, null=True, blank=True)
    
    attendance_time = models.DateTimeField(null=True, blank=True)
    leave_time = models.DateTimeField(null=True, blank=True)
    
    notes = models.CharField(max_length=300, null=True, blank=True)
    
    date = models.DateField()
    
    def as_dict(self):
        
        data = {
            'id': self.id,
            'name': self.name,
            'attendance_time': self.formatted_attendance_time,
            'leave_time': self.formatted_leave_time,
            'notes': self.notes,
            'created': self.created.astimezone(pendulum.timezone(settings.TIME_ZONE)).strftime('%d/%m/%Y %I:%M %p')
        }
        
        return data
    
    @property
    def formatted_attendance_time(self):
        return self.attendance_time.astimezone(tz).strftime('%I:%M %p')
    
    @property
    def formatted_leave_time(self):
        return self.leave_time.astimezone(tz).strftime('%I:%M %p')


class DailyAttendance(TimeStampedModel):
    
    date = models.DateField()
    
    def __str__(self):
        return str(self.date)
    
    def as_dict(self, **kwargs):
        
        data = {
            'id': self.id,
            'date': self.date.strftime('%d/%m/%Y'),
        }
        
        return data
