from django.conf.urls import url, include
from django.contrib import admin
from .views import *

app_name = 'devices'

urlpatterns = [
    
    # Regular URLs
    url(r'^device-inventory/$', device_inventory_view, name='device_inventory'),
    url(r'^maintenance/$', maintenance_view, name='maintenance_view'),
    url(r'^sparepart-inventory/$', sparepart_inventory_list, name='sparepart_inventory_list'),
    url(r'^sparepart-inventory/(?P<pk>[0-9]+)/$', sparepart_inventory_detail, name='sparepart_inventory_detail'),
    url(r'^device-archive/$', device_archive_view, name='device_archive_view'),
    url(r'^total-filter/$', total_filter_view, name='total_filter_view'),
    
    # Ajax URLs
    url(r'ajax/create-maintenance-device/$', create_maintenance_device),
    url(r'ajax/remove-maintenance-device/$', remove_maintenance_device),
    url(r'ajax/add-sparepart-item/$', add_sparepart_item),
    url(r'ajax/remove-sparepart-item/$', remove_sparepart_item),
        
    url(r'ajax/create-sparepart/$', create_sparepart),
    url(r'ajax/edit-sparepart/$', edit_sparepart),
    url(r'ajax/delete-sparepart/$', delete_sparepart),
    
    url(r'ajax/filter-device-inventory/$', filter_device_inventory),
    url(r'ajax/filter-maintenance/$', filter_maintenance),
    url(r'ajax/filter-sparepart-inventory/$', filter_sparepart_inventory),
    url(r'ajax/filter-device-archive/$', filter_device_archive),
    
    url(r'ajax/get-device-archive-data/$', get_device_archive_data),
    
    url(r'ajax/get-autocomplete-data/$', get_autocomplete_data),
    
    url(r'ajax/total-filter/$', total_filter),
    url(r'ajax/get-total-filter-autocomplete/$', get_total_filter_autocomplete),
    
    url(r'^(?P<serial_number>.*?)/$', device_detail, name='device-detail'),
]
