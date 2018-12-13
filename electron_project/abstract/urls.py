from django.conf.urls import url, include
from django.contrib import admin
from .views import *

urlpatterns = [
    
    # Ajax URLs
    url(r'ajax/sort-table/$', sort_table),
    url(r'^ajax/change-password/$', change_password),
    url(r'^ajax/add-worker/$', add_worker),
]
