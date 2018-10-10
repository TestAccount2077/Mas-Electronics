from django.shortcuts import render
from django.http import JsonResponse

from rest_framework import status

from abstract.utils import get_date_filters, get_abstract_data

from django.views.decorators.csrf import csrf_exempt

from .models import *
from . import utils
from .getters import *

import json


def device_inventory_view(request):
    
    data = get_abstract_data()
    
    devices = InventoryDevice.objects.filter(delivered=False, deleted=False)
    
    data['inventory_devices'] = devices
    
    return render(request, 'devices/device-inventory.html', context=data)

def maintenance_view(request):
    
    data = get_abstract_data()
    
    maintenance_devices = MaintenanceDevice.objects.filter(deleted=False)
    
    data['maintenance_devices'] = (device.as_dict() for device in maintenance_devices)
    
    data['inventory_serials'] = [
        device.serial_number for device in InventoryDevice.objects.filter(
            delivered=False, deleted=False, maintenance_device__isnull=True
        )
    ]
    
    data['devices_and_spareparts'] = {
        device.pk: [sparepart.as_dict() for sparepart in device.spareparts.all()]
        for device in maintenance_devices
    }
    
    data['spareparts'] = [sparepart.name for sparepart in Sparepart.objects.filter(deleted=False)]
    
    return render(request, 'devices/maintenance.html', context=data)

def sparepart_inventory_list(request):
    
    data = get_abstract_data()
    
    data['spareparts'] = Sparepart.objects.filter(deleted=False)
    
    return render(request, 'devices/sparepart-inventory-list.html', context=data)

def sparepart_inventory_detail(request, pk):
    
    data = get_abstract_data()
    
    sparepart = Sparepart.objects.get(pk=pk)
    
    data['devices'] = (device.as_dict() for device in MaintenanceDevice.objects.filter(spareparts__sparepart__name=sparepart.name))
    
    return render(request, 'devices/sparepart-inventory-detail.html', context=data)

def device_archive_view(request):
    
    data = get_abstract_data()
    
    return render(request, 'devices/device-archive.html', context=data)

def get_device_archive_data(request):
    
    if request.is_ajax():
        
        archive_qs = ArchiveDevice.objects.filter(deleted=False)

        archive_devices = []

        for device in archive_qs:
            last_device = archive_qs.filter(inventory_device__serial_number=device.inventory_device.serial_number).last()

            if last_device not in archive_devices:
                archive_devices.append(last_device)
        
        return JsonResponse({
            'archive_devices': [device.as_dict() for device in archive_devices]
        })

def device_detail(request, serial_number):
    
    data = get_abstract_data()
    
    inventory_devices = InventoryDevice.objects.filter(serial_number=serial_number, deleted=False)
    inventory_device = inventory_devices.first()
    
    if not inventory_device:
        inventory_device = InventoryDevice.objects.filter(serial_number=serial_number).first()
        
    company_name = inventory_device.reception_receipt.company_name
    device_type = inventory_device.device_type

    all_devices = [device.as_dict(for_detail=True) for device in inventory_devices]
    
    new_data = {

        'serial_number': serial_number,
        'company_name': company_name,
        'device_type': device_type,

        'devices': all_devices
    }
    
    data.update(**new_data)

    return render(request, 'devices/device-detail.html', context=data)

def total_filter_view(request):
    
    data = get_abstract_data()
    
    inventory_devices = InventoryDevice.objects.filter(delivered=False, deleted=False)
    archive_devices = ArchiveDevice.objects.filter(deleted=False)

    serials = list(set(
        [
            device.serial_number for device in inventory_devices
        ] + [
            device.inventory_device.serial_number for device in archive_devices
        ]
    ))

    receipt_getter = ReceiptGetter()

    companies = receipt_getter.get_companies('reception')
    types = receipt_getter.get_types('reception')
    
    data.update(**{
        'serials': serials,
        'companies': companies,
        'types': types
    })
    
    return render(request, 'devices/total-filter-view.html', context=data)
    

def create_maintenance_device(request):
    
    if request.is_ajax():
        
        serial_number = request.GET['serialNumber']
        assignee = request.GET.get('assignee', '')
        
        maintenance_device = MaintenanceDevice.objects.filter(inventory_device__serial_number=serial_number, deleted=False)
        inventory_device = InventoryDevice.objects.filter(serial_number=serial_number, deleted=False, delivered=False)
        
        if maintenance_device.exists():
            
            return JsonResponse(
                {
                    'error': 'هذا الرقم موجود بالفعل'
                },
                
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not inventory_device.exists():
            
            return JsonResponse(
                {
                    'error': 'هذا الرقم غير موجود بالمخزن'
                },
                
                status=status.HTTP_400_BAD_REQUEST
            )
        
        inventory_device = inventory_device.first()
        
        maintenance_device = MaintenanceDevice.objects.create(
            inventory_device=inventory_device,
            assignee=assignee
        )

        return JsonResponse(maintenance_device.as_dict())
    
def remove_maintenance_device(request):
    
    if request.is_ajax():
        
        data = request.GET
        
        pk = data.get('pk', None)
        serial = data.get('serial', None)
        
        if pk:
            device = MaintenanceDevice.objects.get(pk=pk)
            
        elif serial:
            
            device = MaintenanceDevice.objects.get(
                inventory_device__serial_number=serial,
                inventory_device__delivered=False
            )
        
        context = {}
        
        if device.spareparts.exists():
            
            for sparepart_relation in device.spareparts.all():
                
                sparepart = sparepart_relation.sparepart
                
                sparepart.count += sparepart_relation.count
                sparepart.save()
        
        device.delete()
        
        return JsonResponse(context)

def add_sparepart_item(request):
    
    if request.is_ajax():
        
        data = request.GET
        
        name = data['sparepart']
        count = int(data['count'])
        
        device = MaintenanceDevice.objects.get(pk=data['devicePk'])
        sparepart = Sparepart.objects.get(name=name)
        
        if sparepart.count - count < 0:
            
            return JsonResponse({
                'not_enough_spareparts': 'لا توجد قطع غيار كافية من هذا النوع'
            }, status=400)
        
        sparepart_qs = device.spareparts.filter(sparepart__name=name)
        
        if sparepart_qs.exists():
            sparepart_relation = sparepart_qs.first()
            
            sparepart_relation.count += count
            
            sparepart_relation.save()
            
        else:
            sparepart_relation = device.spareparts.create(sparepart=sparepart, count=count)
        
        sparepart.count -= count
        sparepart.save()
        
        context = {
            'sparepart': sparepart_relation.as_dict()
        }
        
        if sparepart.count < sparepart.minimum_qty:
            context['qty_lt_min'] = True
        
        return JsonResponse(context)
    
def remove_sparepart_item(request):
    
    if request.is_ajax():
        
        relation = DeviceSparepartRelation.objects.get(pk=request.GET['pk'])
        
        sparepart = relation.sparepart
        
        sparepart.count += relation.count
        sparepart.save()
        
        relation.delete()
        
        device = MaintenanceDevice.objects.get(pk=request.GET['devicePk'])
        
        return JsonResponse({
            'spareparts': [sparepart.as_dict() for sparepart in device.spareparts.all()]
        })

@csrf_exempt
def create_sparepart(request):
    
    if request.is_ajax():
        
        data = request.POST
        
        spareparts = Sparepart.objects.filter(name=data['name'], deleted=False)
        
        if spareparts.exists():
            
            return JsonResponse(
                {
                    'sparepart_exists': 'قطعة الغيار هذه موجودة بالفعل'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        sparepart = Sparepart.objects.create(
            name=data['name'],
            count=int(data['count']),
            minimum_qty=int(data['minimum'])
        )
        
        return JsonResponse(sparepart.as_dict(), status=status.HTTP_201_CREATED)
        
def edit_sparepart(request):
    
    if request.is_ajax():
        
        data = request.POST
        
        sparepart_qs = Sparepart.objects.filter(pk=data['pk'])
        
        new_count = int(data['count'])
        new_minimum = int(data['minimum'])
        
        context = {}
        
        if new_count < new_minimum:
            warnings['count_lt_minimum'] = True
            
        sparepart_data = {
            'name': data['name'],
            'count': new_count,
            'minimum_count': new_minimum
        }
            
        sparepart_qs.update(**sparepart_data)
        
        return JsonResponse(context)
    
def delete_sparepart(request):
    
    if request.is_ajax():
        
        sparepart = Sparepart.objects.get(pk=request.GET['pk'])
        
        sparepart.deleted = True
        sparepart.save()
        
        return JsonResponse({})
    
def get_autocomplete_data(request):
    
    if request.is_ajax():
        
        type_ = request.GET['type']
        
        if type_ == 'device-inventory':
            getter = DeviceInventoryGetter()
            
        elif type_ == 'maintenance':
            getter = MaintenanceGetter()
            
        elif type_ == 'sparepart-inventory':
            getter = SparepartGetter()
            
        elif type_ == 'device-archive':
            getter = DeviceArchiveGetter()
            
        elif type_ == 'reception-receipt-archive':
            getter = ReceiptGetter(type_='reception')
            
        elif type_ == 'delivery-receipt-archive':
            getter = ReceiptGetter(type_='delivery')
            
        elif type_ == 'expenses':
            getter = ExpensesGetter()
            
        return JsonResponse(getter.data)

@csrf_exempt
def filter_device_inventory(request):
    
    if request.is_ajax():
        
        data = request.POST
        
        filtered_devices = utils.filter_device_inventory(data)
        
        return JsonResponse({
            'devices': filtered_devices
        })

@csrf_exempt
def filter_maintenance(request):
    
    if request.is_ajax():
        
        data = request.POST
        
        serial = data['serial']
        company = data['company']
        device_type = data['type']
        from_ = data['from']
        to = data['to']
        assignee = data['assignee']
        flaws = data['flaws']
        sparepart = data['sparepart']
        sparepart_count = data['count']
        notes = data['notes']
        
        all_devices = MaintenanceDevice.objects.filter(deleted=False)
        
        if serial:
            serial_devices = all_devices.filter(inventory_device__serial_number=serial)
            
        else:
            serial_devices = all_devices
            
        if company:
            company_devices = all_devices.filter(inventory_device__reception_receipt__company_name=company)
            
        else:
            company_devices = all_devices
            
        if device_type:
            type_devices = all_devices.filter(inventory_device__device_type=device_type)
            
        else:
            type_devices = all_devices
            
        if from_:
            
            from_ = timezone.datetime.strptime(from_, '%d/%m/%Y')
            
            if to:
                to = timezone.datetime.strptime(to, '%d/%m/%Y')
                
            else:
                to = timezone.now()
                
            date_devices = all_devices.filter(inventory_device__entrance_date__range=(from_, to))
                
        elif to:
            
            from_ = timezone.datetime(2000, 1, 1)
            to = timezone.datetime.strptime(to, '%d/%m/%Y')
            
            date_devices = all_devices.filter(inventory_device__entrance_date__range=(from_, to))
            
        else:
            date_devices = all_devices
        
        if assignee:
            assignee_devices = all_devices.filter(assignee=assignee)
            
        else:
            assignee_devices = all_devices
            
        if flaws:
            flaws_devices = all_devices.filter(flaws=flaws)
            
        else:
            flaws_devices = all_devices
            
        if sparepart:
            sparepart_devices = all_devices.filter(sparepart__name=sparepart)
            
        else:
            sparepart_devices = all_devices
            
        if sparepart_count:
            sparepart_count_devices = all_devices.filter(sparepart_count=sparepart_count)
            
        else:
            sparepart_count_devices = all_devices
            
        if notes:
            notes_devices = all_devices.filter(notes=notes)
            
        else:
            notes_devices = all_devices
        
        all_devices = set(all_devices)
        
        filtered_devices = [
            
            serial_devices,
            company_devices,
            type_devices,
            date_devices,
            
            assignee_devices,
            flaws_devices,
            sparepart_devices,
            sparepart_count_devices,
            notes_devices
            
        ]
        
        filtered_devices = [frozenset(qs) for qs in filtered_devices]
        
        filtered_devices = all_devices.intersection(*filtered_devices)
        
        filtered_devices = [device.as_dict() for device in filtered_devices]
        
        return JsonResponse({
            'devices': filtered_devices
        })
    
@csrf_exempt
def filter_sparepart_inventory(request):
    
    if request.is_ajax():
        
        data = request.POST
        name = data['name']
        count = data['count']
        minimum = data['minimum']
        lt_minimum = json.loads(data['lessThanMinimum'])
        
        all_spareparts = Sparepart.objects.filter(deleted=False)
        
        if name:
            name_filter = all_spareparts.filter(name=name)
            
        else:
            name_filter = all_spareparts
            
        if count:
            count = int(count)
            
            count_filter = all_spareparts.filter(count=count)
            
        else:
            count_filter = all_spareparts
            
        if minimum:
            minimum = int(minimum)
            
            minimum_filter = all_spareparts.filter(minimum_qty=minimum)
            
        else:
            minimum_filter = all_spareparts
            
        if lt_minimum:
            
            lt_minimum_filter = [
                sparepart for sparepart in all_spareparts
                if sparepart.count < sparepart.minimum_qty
            ]
            
        else:
            lt_minimum_filter = all_spareparts
            
        all_filters = [
            name_filter,
            count_filter,
            minimum_filter,
            lt_minimum_filter
        ]
        
        all_spareparts = set(all_spareparts)
        
        filtered_spareparts = [frozenset(qs) for qs in all_filters]
        
        filtered_spareparts = all_spareparts.intersection(*filtered_spareparts)
        
        filtered_spareparts = [device.as_dict() for device in filtered_spareparts]
        
        return JsonResponse({
            'spareparts': filtered_spareparts
        })

@csrf_exempt
def filter_device_archive(request):
    
    if request.is_ajax():
        
        data = request.POST
        
        filtered_devices = utils.filter_device_archive(data)
        
        return JsonResponse({
            'devices': filtered_devices
        })
    
@csrf_exempt
def total_filter(request):
    
    if request.is_ajax():
        
        data = request.POST
        serial = data['serial']
        company = data['company']
        device_type = data['type']
        from_ = data['from']
        to = data['to']
        
        inventory_devices = utils.filter_device_inventory(
            data,
            include_returned=False,
            dict_type='as_total_filter_dict'
        )
        
        archive_devices = utils.filter_device_archive(
            data,
            include_in_inventory=False,
            dict_type='as_total_filter_dict'
        )
        
        all_devices = inventory_devices + archive_devices
        
        return JsonResponse({
            'devices': all_devices
        })
        
        inventory_devices = InventoryDevice.objects.filter(deleted=False, delivered=False)
        archive_devices = ArchiveDevice.objects.filter(deleted=False)
        
        all_devices = list(inventory_devices) + list(archive_devices)
        
        if serial:
            
            serial_devices = list(inventory_devices.filter(serial_number=serial)) + list(archive_devices.filter(inventory_device__serial_number=serial))
            
        else:
            serial_devices = all_devices
        
        if company:
            
            company_devices = list(inventory_devices.filter(reception_receipt__company_name=company)) + list(archive_devices.filter(delivery_receipt__company_name=company))
        
        else:
            company_devices = all_devices
        
        if device_type:
            
            type_devices = list(inventory_devices.filter(device_type=device_type)) + list(archive_devices.filter(inventory_device__device_type=device_type))
        
        else:
            type_devices = all_devices
        
        inventory_date_devices = list(get_date_filters(from_, to, 'entrance_date__range', inventory_devices))
        archive_date_devices = list(get_date_filters(from_, to, 'leave_date__range', archive_devices))
        
        date_devices = list(inventory_date_devices + archive_date_devices)
        
        filtered_devices = set(serial_devices + company_devices + type_devices + date_devices)
        
        #filtered_devices = [frozenset(qs) for qs in filtered_devices]
        #filtered_devices = all_devices.intersection(*filtered_devices)
        #filtered_devices = utils.prepare_for_total_filter(filtered_devices)
        
        if serial_devices and company_devices and company_devices and type_devices and date_devices:
            filtered_devices = [device.as_total_filter_dict() for device in filtered_devices]
            
        else:
            filtered_devices = []
        
        return JsonResponse({
            'devices': filtered_devices
        })
    
def get_total_filter_autocomplete(request):
    
    if request.is_ajax():
        
        inventory_devices = InventoryDevice.objects.filter(delivered=False, deleted=False)
        archive_devices = ArchiveDevice.objects.filter(deleted=False)
        
        serials = list(set(
            [
                device.serial_number for device in inventory_devices
            ] + [
                device.inventory_device.serial_number for device in archive_devices
            ]
        ))
        
        receipt_getter = ReceiptGetter()
        
        companies = receipt_getter.get_companies('reception')
        types = receipt_getter.get_types('reception')
        
        return JsonResponse({
            'serials': serials,
            'companies': companies,
            'types': types
        })
