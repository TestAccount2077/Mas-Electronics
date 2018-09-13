from django.conf.urls import url, include
from django.contrib import admin
from .views import *

app_name = 'receipts'

urlpatterns = [
    
    # Regular URLs
    url(r'^new-reception-receipt/$', new_reception_receipt_view, name='new_reception_receipt_view'),
    url(r'^new-delivery-receipt/$', new_delivery_receipt_view, name='new_delivery_receipt_view'),
    
    url(r'^reception-receipt-archive/$', reception_receipt_archive_view, name='reception_receipt_archive_view'),
    url(r'^delivery-receipt-archive/$', delivery_receipt_archive_view, name='delivery_receipt_archive_view'),
    
    url(r'^reception-receipt-archive/(?P<pk>[0-9]+)/$', reception_receipt_detail, name='reception_receipt_detail'),
    url(r'^delivery-receipt-archive/(?P<pk>[0-9]+)/$', delivery_receipt_detail, name='delivery_receipt_detail'),
    
    # Ajax URLs
    url(r'ajax/create-reception-receipt/$', create_reception_receipt),
    url(r'ajax/create-delivery-receipt/$', create_delivery_receipt),
    
    url(r'ajax/update-receipt-company/$', update_receipt_company),
    url(r'ajax/update-device-type/$', update_device_type),
    
    url(r'ajax/delete-device/$', delete_device),
    
    url(r'ajax/get-device-receipts/$', get_device_receipts),
    
    url(r'ajax/edit-serial/$', edit_serial),
    
    url(r'ajax/filter-receipt-archive/$', filter_receipt_archive),
]
