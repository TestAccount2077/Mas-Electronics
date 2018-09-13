from django.conf.urls import url, include
from django.contrib import admin
from .views import *

app_name = 'attendance'

urlpatterns = [
    
    # Regular URLs
    
    url(r'^daily-attendance/$', daily_attendance_view, name='daily_attendance_view'),
    #url(r'^attendance-archive/$', attendance_archive_list, name='attendance_archive_list'),
    #url(r'^attendance-archive/(?P<pk>[0-9]+)/$', attendance_archive_detail, name='attendance_archive_detail'),
    
    # Ajax URLs
    
    url(r'ajax/create-attendance/$', create_attendance),
    #url(r'ajax/delete-attendance/$', delete_attendance),
    
    #url(r'ajax/filter-attendance/$', filter_attendance),
    #url(r'ajax/close-account/$', close_account)
]
