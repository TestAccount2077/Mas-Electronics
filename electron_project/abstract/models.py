from django.db import models
import importlib as imp

class TimeStampedModel(models.Model):
    
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)
    
    deleted = models.BooleanField(default=False)
    
    class Meta:
        
        abstract = True
        ordering = ('created',)


class WorkerAccount(TimeStampedModel):
    
    username = models.CharField(max_length=300, unique=True)
    password = models.CharField(max_length=300, unique=True)


class App(models.Model):
    
    password = models.CharField(max_length=255, null=True, blank=True)
    
    current_balance = models.FloatField(default=0.0)
    

class BaseReceipt(TimeStampedModel):
    
    company_name = models.CharField(max_length=300)
    
    inner_representative = models.CharField(max_length=300, default='')
    outer_representative = models.CharField(max_length=300, default='')
    
    date = models.DateField(null=True, blank=True)
    
    synced = models.BooleanField(default=True)
    
    class Meta(TimeStampedModel.Meta):
        
        abstract = True
    
    def as_dict(self, for_receipt=False):
        
        data = {
            
            'id': self.id,
            
            'company_name': self.company_name,
            'date': self.formatted_date,
            
            'inner_representative': self.inner_representative,
            'outer_representative': self.outer_representative,
            
            'device_count': self.devices.filter(deleted=False).count(),
            'type': 'اذن استلام' if self.type_ == 'reception' else 'اذن تسليم',
            'literal_type': self.type_
            
        }
        
        if for_receipt:
            
            device_data = {}
            
            data['devices'] = [
                device.as_dict() for device in self.devices.filter(deleted=False)
            ]
            
            for device in self.devices.filter(deleted=False):
                
                if hasattr(device, 'delivery_receipt'):
                    device = device.inventory_device
                    
                    if device.device_type in device_data.keys():
                        device_data[device.device_type]['count'] += 1
                        device_data[device.device_type]['serials'].append(device.serial_number)
                        
                    else:
                        device_data[device.device_type] = {
                            'count': 1,
                            'serials': [device.serial_number,]
                        }
                
                else:
                    
                    if device.device_type in device_data.keys():
                        device_data[device.device_type]['count'] += 1
                        device_data[device.device_type]['serials'].append(device.serial_number)
                        
                    else:
                        device_data[device.device_type] = {
                            'count': 1,
                            'serials': [device.serial_number,]
                        }
                    
            data.update({'row_data': device_data})
        
        else:
            data['devices'] = [device.as_dict() for device in self.devices.all()]
            
        return data
    
    def as_sync_dict(self):
        
        data = {
            'company': self.company_name,
            'date': self.formatted_date,
            
            'inner_representative': self.inner_representative,
            'outer_representative': self.outer_representative,
        }
        
        device_data = {}
        
        for device in self.devices.filter(deleted=False):
            
            if self.type_ == 'delivery':
                device = device.inventory_device
                
            if device_data.get(device.device_type, None):
                device_data[device.device_type].append(device.serial_number)

            else:
                device_data[device.device_type] = [device.serial_number, ]
        
        formatted_device_data = []
        
        for type_, serials in device_data.items():
            
            data_piece =  {
                'type': type_,
                'qty': len(serials),
                'serialNumbers': serials
            }
            
            formatted_device_data.append(data_piece)
        
        data['data'] = formatted_device_data
        
        return data
    
    @property
    def formatted_date(self):
        
        return self.date.strftime('%d/%m/%Y')
    
    @property
    def type_(self):
        
        return 'reception' if isinstance(self, imp.import_module('receipts.models').ReceptionReceipt) else 'delivery'
