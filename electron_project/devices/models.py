from django.db import models
from django.utils import timezone

from abstract.models import TimeStampedModel

from receipts.models import ReceptionReceipt, DeliveryReceipt

import pendulum

tz = pendulum.timezone('Africa/Cairo')


class InventoryDevice(TimeStampedModel):
    
    reception_receipt = models.ForeignKey(ReceptionReceipt, related_name='devices')
    
    serial_number = models.CharField(max_length=300)
    device_type = models.CharField(max_length=300)
    entrance_date = models.DateTimeField()
    delivered = models.BooleanField(default=False)
    
    def as_dict(self, for_detail=False):
        
        data = {
            
            'pk': self.pk,
            
            'reception_receipt_id': self.reception_receipt.id,
            'delivery_receipt_id': self.archive_device.delivery_receipt.id if hasattr(self, 'archive_device') else '',
            
            'serial_number': self.serial_number,
            'company_name': self.reception_receipt.company_name,
            'device_type': self.device_type,
            'entrance_date': self.entrance_date.astimezone(tz).strftime('%d/%m/%Y'),
            'is_returned': self.is_returned,
            'returned_icon': self.returned_icon
            
        }
        
        if hasattr(self, 'maintenance_device'):
            if self.maintenance_device:
            
                maintenance_data = self.maintenance_device.as_dict()
                maintenance_data.pop('pk')
                data.update(maintenance_data)
        
        if for_detail:
            
            data.pop('pk')
            data.pop('is_returned')
        
        return data
    
    def __str__(self):
        
        return self.serial_number
    
    @property
    def is_returned(self):
        
        three_months_ago = timezone.now() - timezone.timedelta(days=90)
        
        return ArchiveDevice.objects.filter(deleted=False, inventory_device__serial_number=self.serial_number, leave_date__range=(three_months_ago, timezone.now())).exists()
    
    @property
    def returned_icon(self):
        
        if self.is_returned:
            return '/static/images/check.png'
        
        return '/static/images/X.png'
    
    def as_total_filter_dict(self):
        
        return {
            'serial_number': self.serial_number,
            'company_name': self.reception_receipt.company_name,
            'date': self.entrance_date.astimezone(tz).strftime('%d/%m/%Y'),
            'device_type': self.device_type,
            'location': 'المخزن'
        }
    
    
class MaintenanceDevice(TimeStampedModel):
    
    inventory_device = models.OneToOneField(InventoryDevice, null=True, blank=True, related_name='maintenance_device')
    
    assignee = models.CharField(max_length=300, default='')
    flaws = models.CharField(max_length=300, default='')
    notes = models.CharField(max_length=300, default='')
    
    deleted = models.BooleanField(default=False)
    
    def as_dict(self):
        
        data = {
            
            'pk': self.pk,
            
            'serial_number': self.inventory_device.serial_number,
            'company_name': self.inventory_device.reception_receipt.company_name,
            'device_type':   self.inventory_device.device_type,
            'entrance_date': self.inventory_device.entrance_date.astimezone(tz).strftime('%d/%m/%Y'),
            
            'reception_receipt_id': self.inventory_device.reception_receipt.pk,
            
            'assignee': self.assignee,
            'flaws': self.flaws,
            'notes': self.notes,
            'spareparts': [sparepart.as_dict() for sparepart in self.spareparts.all()],
            
            'assignee_class': 'editable-locked' if self.assignee else 'maintenance-empty',
            'flaws_class': 'editable-locked' if self.flaws else 'maintenance-empty',
            'notes_class': 'editable-locked' if self.notes else 'maintenance-empty'
        }
        
        print(data['spareparts'])
        
        return data


class ArchiveDevice(TimeStampedModel):
    
    delivery_receipt = models.ForeignKey(DeliveryReceipt, related_name='devices')
    
    inventory_device = models.OneToOneField(InventoryDevice, null=True, blank=True, related_name='archive_device')
    
    leave_date = models.DateTimeField()
        
    def as_dict(self, for_detail=False):
        
        data = {
            
            'pk': self.pk,
            
            'serial_number': self.inventory_device.serial_number,
            'company_name': self.delivery_receipt.company_name,
            'device_type': self.inventory_device.device_type,
            'leave_date': self.leave_date.astimezone(tz).strftime('%d/%m/%Y'),
            
            'reception_receipt_id': self.inventory_device.reception_receipt.id,
            'delivery_receipt_id': self.delivery_receipt.id,
            
            'entrance_date': self.inventory_device.entrance_date.astimezone(tz).strftime('%d/%m/%Y'),
            
            'in_inventory': self.in_inventory,
            'in_inventory_icon': self.in_inventory_icon
            
        }
        
        if hasattr(self.inventory_device, 'maintenance_device'):
            if self.inventory_device.maintenance_device:
            
                maintenance_data = self.inventory_device.maintenance_device.as_dict()
                maintenance_data.pop('pk')
                data.update(maintenance_data)
            
        if for_detail:
            data.pop('pk')
        
        return data
    
    @property
    def in_inventory(self):
        
        return InventoryDevice.objects.filter(
            deleted=False, delivered=False, serial_number=self.inventory_device.serial_number
        ).exists()
    
    @property
    def in_inventory_icon(self):
        
        if self.in_inventory:
            return '/static/images/check.png'
        
        return '/static/images/X.png'
    
    def as_total_filter_dict(self):
        
        return {
            'serial_number': self.inventory_device.serial_number,
            'company_name': self.delivery_receipt.company_name,
            'device_type': self.inventory_device.device_type,
            'date': self.leave_date.astimezone(tz).strftime('%d/%m/%Y'),
            'location': 'الأرشيف'
        }


class Sparepart(TimeStampedModel):
    
    name = models.CharField(max_length=300)
    count = models.IntegerField()
    minimum_qty = models.IntegerField()
    
    def as_dict(self):
        
        return {
            
            'pk': self.pk,
            
            'name': self.name,
            'count': self.count,
            'minimum_qty': self.minimum_qty,
            'count_lt_minimum': self.count < self.minimum_qty,
            'count_lt_min_class': self.count_lt_min_class
        }
    
    @property
    def count_lt_min_class(self):
        
        return 'expense-td' if self.count < self.minimum_qty else ''

class DeviceSparepartRelation(TimeStampedModel):
    
    device = models.ForeignKey(MaintenanceDevice, null=True, blank=True, related_name='spareparts')
    sparepart = models.ForeignKey(Sparepart, null=True, blank=True, related_name='devices')
    
    count = models.IntegerField(default=0)
    
    def as_dict(self):
        
        return {
            'id': self.id,
            'name': self.sparepart.name,
            'count': self.count
        }
