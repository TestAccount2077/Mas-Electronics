from django.shortcuts import render
from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings

from rest_framework import status

from .models import *
from devices.models import *
from devices.getters import ReceiptGetter

from accounts.utils import get_receipts_data

from abstract.utils import get_object_or_None, get_abstract_data, get_date_filters

import json, datetime, pendulum


def new_reception_receipt_view(request):
    
    data = get_abstract_data()
    
    data['current_reception_id'] = ReceptionReceipt.objects.last().id + 1 if ReceptionReceipt.objects.exists() else 1
    
    receipt_getter = ReceiptGetter()
    
    data['new_reception_receipt_serials'] = get_receipts_data('reception', 'serial')
    data['new_reception_receipt_companies'] = receipt_getter.get_companies('reception')
    data['new_reception_receipt_types'] = receipt_getter.get_types('reception')
    data['inner_reprs'] = receipt_getter.get_representatives('inner')
    data['outer_reprs'] = receipt_getter.get_representatives('outer')
    data['data'] = dict(request.GET)
    data['company'] = request.GET.get('company', '')
    
    return render(request, 'receipts/new-reception-receipt.html', context=data)

def new_delivery_receipt_view(request):
        
    data = get_abstract_data()
    
    data['current_delivery_id'] = DeliveryReceipt.objects.last().id + 1 if DeliveryReceipt.objects.exists() else 1
    
    receipt_getter = ReceiptGetter()
    
    data['new_delivery_receipt_serials'] = get_receipts_data('delivery', 'serial')
    data['new_delivery_receipt_companies'] = receipt_getter.get_companies('delivery')
    data['new_delivery_receipt_types'] = receipt_getter.get_types('delivery')
    data['inner_reprs'] = receipt_getter.get_representatives('inner')
    data['outer_reprs'] = receipt_getter.get_representatives('outer')
    data['data'] = dict(request.GET)
    data['company'] = request.GET.get('company', '')
    
    return render(request, 'receipts/new-delivery-receipt.html', context=data)

def reception_receipt_archive_view(request):
    
    data = get_abstract_data()
    
    data['reception_receipts'] = ReceptionReceipt.objects.all()
    
    return render(request, 'receipts/reception-receipt-archive.html', context=data)

def delivery_receipt_archive_view(request):
    
    data = get_abstract_data()
    
    data['delivery_receipts'] = DeliveryReceipt.objects.all()
    
    return render(request, 'receipts/delivery-receipt-archive.html', context=data)

def reception_receipt_detail(request, pk):
    
    data = get_abstract_data()
    
    receipt = ReceptionReceipt.objects.get(pk=pk)
    
    data['receipt'] = receipt.as_dict(for_receipt=True)
    data['receipt_json'] = json.dumps(receipt.as_dict(for_receipt=True))
    
    return render(request, 'receipts/reception-receipt-detail.html', context=data)

def delivery_receipt_detail(request, pk):
    
    data = get_abstract_data()
    
    receipt = DeliveryReceipt.objects.get(pk=pk)
    
    data['receipt'] = receipt.as_dict(for_receipt=True)
    data['receipt_json'] = json.dumps(receipt.as_dict(for_receipt=True))
    
    return render(request, 'receipts/delivery-receipt-detail.html', context=data)

@csrf_exempt
def create_reception_receipt(request):
    
    if request.is_ajax():
        
        data = request.POST
        
        receipt_data = json.loads(data['data'])
        company = data['company']
        date = datetime.datetime.strptime(data['date'], '%d/%m/%Y').replace(tzinfo=pendulum.timezone(settings.TIME_ZONE))
        
        inner_representative = data['innerRepresentative']
        outer_representative = data['outerRepresentative']
        
        existing_serials = []
        non_matching_serials = []
        all_serials = []
        duplicate_serials =[]        
        errors = {}
        
        for item in receipt_data:
            
            device_type = item['type']
            serial_numbers = item['serialNumbers']
            
            for serial in serial_numbers:
                if serial not in all_serials:
                    all_serials.append(serial)
                    
                elif serial not in duplicate_serials:
                    duplicate_serials.append(serial)
                
                inventory_devices = InventoryDevice.objects.filter(serial_number=serial, deleted=False, delivered=False)
                archive_devices = ArchiveDevice.objects.filter(inventory_device__serial_number=serial)
                
                if inventory_devices.exists():
                    existing_serials.append(serial)
                    
                if archive_devices.exists():
                    first_device = archive_devices.first()
                    
                    if company != first_device.delivery_receipt.company_name or device_type != first_device.inventory_device.device_type:
                        non_matching_serials.append(serial)
        
        if existing_serials:
            
            existing_serials_message = 'الأرقام التالية موجودة بالفعل:<br>'
            
            for index, serial in enumerate(existing_serials):
                existing_serials_message += '- {}<br>'.format(serial)
                
            errors['existing_serials_message'] = existing_serials_message
                
        if non_matching_serials:
            
            non_matching_serials_message = 'الأرقام التالية موجودة فى الأرشيف ببيانات مختلفة:<br>'
            
            for serial in non_matching_serials:
                non_matching_serials_message += '- {}<br>'.format(serial)
                
            errors['non_matching_serials_message'] = non_matching_serials_message
            
        if duplicate_serials:
            duplicate_serials_message = 'الارقام التالية مكررة: <br>'
            
            for serial in duplicate_serials:
                duplicate_serials_message += '- {}<br>'.format(serial)
                
            errors['duplicate_serials_message'] = duplicate_serials_message
            
        if errors:
            return JsonResponse(errors, status=status.HTTP_400_BAD_REQUEST)
        
        reception_receipt = ReceptionReceipt.objects.create(
            company_name=company,
            date=date,
            inner_representative=inner_representative,
            outer_representative=outer_representative
        )
        
        devices = []
        
        for item in receipt_data:
            
            qty = item['qty']
            device_type = item['type']
            serial_numbers = item['serialNumbers']
            
            for serial in serial_numbers:
                
                inventory_device = reception_receipt.devices.create(
                    serial_number=serial,
                    device_type=device_type,
                    entrance_date=date
                )
                
                devices.append(inventory_device.as_dict())
        
        receipt_getter = ReceiptGetter()
        
        return JsonResponse(
            {
                'receipt': reception_receipt.as_dict(),
                'devices': devices,
                
                'reception_companies': receipt_getter.get_companies('reception'),
                'delivery_companies': receipt_getter.get_companies('delivery'),
                
                'reception_types': receipt_getter.get_types('reception'),
                'delivery_types': receipt_getter.get_types('delivery'),
                
                'inner_representatives': receipt_getter.get_representatives('inner'),
                'outer_representatives': receipt_getter.get_representatives('outer'),
                
            }
        )
    
@csrf_exempt
def create_delivery_receipt(request):
    
    if request.is_ajax():
        
        data = request.POST
        
        receipt_data = json.loads(data['data'])
        company = data['company']
        
        date = datetime.datetime.strptime(data['date'], '%d/%m/%Y').replace(tzinfo=pendulum.timezone(settings.TIME_ZONE))
        
        inner_representative = data['innerRepresentative']
        outer_representative = data['outerRepresentative']
        
        not_existing_serials = []
        
        for item in receipt_data:
            
            qty = item['qty']
            device_type = item['type']
            serial_numbers = item['serialNumbers']
            
            for serial in serial_numbers:
                
                inventory_device = InventoryDevice.objects.filter(
                    reception_receipt__company_name=company,
                    serial_number=serial,
                    device_type=device_type,
                    
                    deleted=False
                )
                
                if not inventory_device.exists():
                    not_existing_serials.append(serial)
        
        if not_existing_serials:
            
            message = 'الأرقام التالية غير متطابقة البيانات أو غير موجودة:<br>'
            
            for index, serial in enumerate(not_existing_serials):
                message += '- {}<br>'.format(serial)
            
            return JsonResponse(
                {
                    'not_existing_serials': message
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        delivery_receipt = DeliveryReceipt.objects.create(
            company_name=company,
            date=date,
            inner_representative=inner_representative,
            outer_representative=outer_representative
        )
        
        devices = []
        
        for item in receipt_data:
            
            qty = item['qty']
            type_ = item['type']
            serial_numbers = item['serialNumbers']
            
            for serial in serial_numbers:
                
                maintenance_device = get_object_or_None(MaintenanceDevice, inventory_device__serial_number=serial)
                inventory_device = InventoryDevice.objects.filter(serial_number=serial).last()
                
                inventory_device.delivered = True
                inventory_device.save()
                
                if maintenance_device:
                    maintenance_device.deleted = True
                    maintenance_device.save()
                
                archive_device = delivery_receipt.devices.create(                    
                    inventory_device = inventory_device,
                    leave_date=date
                )
                
                devices.append(archive_device.as_dict())
        
        receipt_getter = ReceiptGetter()
        
        return JsonResponse(
            {
                'receipt': delivery_receipt.as_dict(),
                'devices': devices,
                
                'reception_companies': receipt_getter.get_companies('delivery'),
                'delivery_companies': receipt_getter.get_companies('reception'),
                
                'reception_types': receipt_getter.get_types('reception'),
                'delivery_types': receipt_getter.get_types('delivery'),
                
                'inner_representatives': receipt_getter.get_representatives('inner'),
                'outer_representatives': receipt_getter.get_representatives('outer')
            }
        )   

def update_receipt_company(request):
    
    if request.is_ajax():
        
        data = request.GET
        pk = data['pk']
        
        if data['type'] == 'اذن استلام':
            receipt = ReceptionReceipt.objects.get(pk=pk)
            type_ = 'reception'
            
        else:
            receipt = DeliveryReceipt.objects.get(pk=pk)
            type_ = 'delivery'
        
        receipt.company_name = data['newCompanyName']
        receipt.save()
        
        return JsonResponse({
            'pk': receipt.pk,
            'type': type_
        })

def update_device_type(request):
    
    if request.is_ajax():
        
        data = request.GET
        
        old_type = data['oldType']
        new_type = data['newType']
        
        receipt_type = data['receiptType']
        
        if receipt_type == 'اذن استلام':
            receipt = ReceptionReceipt.objects.get(pk=data['receiptPk'])
            
            devices = receipt.devices.filter(device_type=old_type)
            
            devices.update(device_type=new_type)
            
        else:
            receipt = DeliveryReceipt.objects.get(pk=data['receiptPk'])
            
            devices = receipt.devices.filter(inventory_device__device_type=old_type)
            
            for device in devices:
                inventory_device = device.inventory_device
                
                inventory_device.device_type = new_type
                inventory_device.save()
                
        return JsonResponse({
            'device_pks': [str(device.pk) for device in devices]
        })
        
def delete_device(request):
    
    if request.is_ajax():
        
        data = request.GET
        action = data['action']
        
        if action == 'delete-here-only':
            
            receipt_type = data['receiptType']
            
            if receipt_type == 'اذن استلام':
                receipt = ReceptionReceipt.objects.get(pk=data['receiptPk'])
                device = receipt.devices.get(serial_number=data['serial'])
                
            else:
                receipt = DeliveryReceipt.objects.get(pk=data['receiptPk'])
                device = receipt.devices.get(inventory_device__serial_number=data['serial'])
                
            device.deleted = True
            device.save()
            
        else:
            
            serial = data['serial']
            inventory_devices = InventoryDevice.objects.filter(serial_number=serial)
            archive_devices = ArchiveDevice.objects.filter(inventory_device__serial_number=serial)
            
            inventory_devices.update(deleted=True)
            archive_devices.update(deleted=True)
            
        return JsonResponse({})

def get_device_receipts(request):
    
    if request.is_ajax():
        
        context = {}
        
        old_serial = request.GET['oldSerial']
        new_serial = request.GET['newSerial']
        
        old_serial_device = InventoryDevice.objects.filter(serial_number=old_serial).first()
        
        new_serial_device = InventoryDevice.objects.filter(serial_number=new_serial).first()
        
        if new_serial_device  and (
                old_serial_device.reception_receipt.company_name != new_serial_device.reception_receipt.company_name or
                
                old_serial_device.device_type != new_serial_device.device_type
                
            ):
                context['already_exists'] = True
                
        else:
            
            reception_receipts = ReceptionReceipt.objects.filter(devices__serial_number=old_serial)
            delivery_receipts = DeliveryReceipt.objects.filter(devices__inventory_device__serial_number=old_serial)
            
            context['receipts'] = [
                receipt.as_dict() for receipt in list(reception_receipts) + list(delivery_receipts)
            ]
            
        return JsonResponse(context)

def edit_serial(request):
    
    if request.is_ajax():
        
        data = request.GET
        
        receipts = json.loads(data['receipts'])
                
        for receipt in receipts:
            
            if receipt['type'] == 'reception':
                receipt = ReceptionReceipt.objects.get(pk=receipt['pk'])
                
                device = receipt.devices.get(serial_number=data['oldSerial'])
                
                device.serial_number = data['newSerial']
                device.save()
                
            else:
                receipt = DeliveryReceipt.objects.get(pk=receipt['pk'])
                
                try:
                    device = receipt.devices.get(inventory_device__serial_number=data['oldSerial'])

                    inventory_device = device.inventory_device
                    inventory_device.serial_number = data['newSerial']
                    inventory_device.save()
                    
                except ArchiveDevice.DoesNotExist:
                    pass
        
        return JsonResponse({})

@csrf_exempt
def filter_receipt_archive(request):
    
    if request.is_ajax():
        
        data = request.POST
        
        pk = data['id']
        company = data['company']
        from_ = data['from']
        to = data['to']
        inner_repr = data['innerRepr']
        outer_repr = data['outerRepr']
        type_ = data['type']
        
        if type_ == 'reception':
            manager = ReceptionReceipt.objects
            
        elif type_ == 'delivery':
            manager = DeliveryReceipt.objects
            
        all_receipts = manager.all()
            
        if pk:
            pk_receipts = manager.filter(pk=pk)
            
        else:
            pk_receipts = all_receipts
            
        if company:
            company_receipts = manager.filter(company_name=company)
            
        else:
            company_receipts = all_receipts
            
        date_receipts = get_date_filters(from_, to, 'date__range', all_receipts)
        
        if inner_repr:
            inner_repr_receipts = manager.filter(inner_representative=inner_repr)
        
        else:
            inner_repr_receipts = all_receipts
            
        if outer_repr:
            outer_repr_receipts = manager.filter(outer_representative=outer_repr)
            
        else:
            outer_repr_receipts = all_receipts
            
        filtered_receipts = [

            pk_receipts,
            company_receipts,
            date_receipts,
            inner_repr_receipts,
            outer_repr_receipts

        ]
        
        all_receipts = set(all_receipts)

        filtered_receipts = [frozenset(qs) for qs in filtered_receipts]

        filtered_receipts = all_receipts.intersection(*filtered_receipts)
        filtered_receipts = [receipt.as_dict() for receipt in filtered_receipts]
                
        return JsonResponse({
            'receipts': filtered_receipts
        })
