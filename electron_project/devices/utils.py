from .models import *
from abstract.utils import get_date_filters

import json


def prepare_for_total_filter(devices):
    
    prepared_devices = []
    
    for device in devices:
        device_data = device.as_total_filter_dict()
        
        prepared_devices.append(device_data)
        
        if hasattr(device, 'archive_device'):
            archive_device_data = device.archive_device.as_total_filter_dict()
            
            prepared_devices.append(archive_device_data)
            
    return prepared_devices

def filter_device_inventory(data, include_returned=True, dict_type='as_dict'):
    
    serial = data['serial']
    company = data['company']
    device_type = data['type']
    from_ = data['from']
    to = data['to']

    all_devices = InventoryDevice.objects.filter(deleted=False, delivered=False)

    if serial:
        serial_devices = all_devices.filter(serial_number=serial)

    else:
        serial_devices = all_devices

    if company:
        company_devices = all_devices.filter(reception_receipt__company_name=company)

    else:
        company_devices = all_devices

    if device_type:
        type_devices = all_devices.filter(device_type=device_type)

    else:
        type_devices = all_devices

    date_devices = get_date_filters(from_, to, 'entrance_date__range', all_devices)
    
    filtered_devices = [
        
        serial_devices,
        company_devices,
        type_devices,
        date_devices
        
    ]
    
    if include_returned:
        returned = json.loads(data['returned'])
        
        if returned:
            returned_devices = list(filter(lambda device: device.is_returned == returned, all_devices))
            
        else:
            returned_devices = all_devices
        
        filtered_devices.append(returned_devices)
    
    all_devices = set(all_devices)
    
    filtered_devices = [frozenset(qs) for qs in filtered_devices]
    
    filtered_devices = all_devices.intersection(*filtered_devices)
    
    if dict_type == 'as_dict':
        filtered_devices = [device.as_dict() for device in filtered_devices]
    
    elif dict_type == 'as_total_filter_dict':
        filtered_devices = [device.as_total_filter_dict() for device in filtered_devices]
    
    return filtered_devices

def clean_archive_devices(devices):
    
    '''
    This function removes any possible duplicates from ArchiveDevice instances in terms of serial number
    '''
    
    serials = []
    clean_devices = []
    
    for device in devices:
        serial = device.inventory_device.serial_number
        
        if serial not in serials:
            serials.append(serial)
            clean_devices.append(device)
            
    return clean_devices

def filter_device_archive(data, include_in_inventory=True, dict_type='as_dict'):
    
    serial = data['serial']
    company = data['company']
    device_type = data['type']
    from_ = data['from']
    to = data['to']

    all_devices = ArchiveDevice.objects.filter(deleted=False)

    if serial:
        serial_devices = all_devices.filter(inventory_device__serial_number=serial)

    else:
        serial_devices = all_devices

    if company:
        company_devices = all_devices.filter(delivery_receipt__company_name=company)

    else:
        company_devices = all_devices

    if device_type:
        type_devices = all_devices.filter(inventory_device__device_type=device_type)

    else:
        type_devices = all_devices

    date_devices = get_date_filters(from_, to, 'leave_date__range', all_devices)
    
    filtered_devices = [
        
        serial_devices,
        company_devices,
        type_devices,
        date_devices
        
    ]
    
    if include_in_inventory:
        in_inventory = json.loads(data['inInventory'])
        
        if in_inventory:
            devices_in_inventory = list(filter(lambda device: device.in_inventory == in_inventory, all_devices))
            
        else:
            devices_in_inventory = all_devices
        
        filtered_devices.append(devices_in_inventory)
    
    all_devices = set(all_devices)
    
    filtered_devices = [frozenset(qs) for qs in filtered_devices]
    
    filtered_devices = all_devices.intersection(*filtered_devices)
    
    filtered_devices = clean_archive_devices(filtered_devices)
    
    if dict_type == 'as_dict':
        filtered_devices = [device.as_dict() for device in filtered_devices]
    
    elif dict_type == 'as_total_filter_dict':
        filtered_devices = [device.as_total_filter_dict() for device in filtered_devices]
    
    return filtered_devices