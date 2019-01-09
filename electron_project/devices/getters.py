from devices.models import *
from expenses.models import *


class DeviceInventoryGetter(object):
    
    @property
    def data(self):
        
        data = {
            'serials': self.serials,
            'companies': self.companies,
            'device_types': self.device_types
        }
        
        return data
        
    @property
    def serials(self):
        return list(set([device.serial_number for device in InventoryDevice.objects.filter(deleted=False, delivered=False)]))
    
    @property
    def companies(self):
        return list(set([device.reception_receipt.company_name for device in InventoryDevice.objects.filter(deleted=False, delivered=False)]))
    
    @property
    def device_types(self):
        return list(set([device.device_type for device in InventoryDevice.objects.filter(deleted=False, delivered=False)]))
    
    
class MaintenanceGetter(DeviceInventoryGetter):
    
    @property
    def data(self):
        
        data = {
            'serials': self.serials,
            'companies': self.companies,
            'device_types': self.device_types,
            'assignees': self.assignees,
            'flaws': self.flaws,
            'spareparts': self.spareparts,
            'notes': self.notes
        }
        
        return data
    
    @property
    def serials(self):
        return [device.inventory_device.serial_number for device in MaintenanceDevice.objects.filter(deleted=False)]
    
    @property
    def companies(self):
        
        return [
            device.inventory_device.reception_receipt.company_name
            for device in MaintenanceDevice.objects.filter(deleted=False)
        ]
    
    @property
    def device_types(self):
        return [device.inventory_device.device_type for device in MaintenanceDevice.objects.filter(deleted=False)]
    
    @property
    def assignees(self):
        return list(set([device.assignee for device in MaintenanceDevice.objects.filter(deleted=False)]))
    
    @property
    def flaws(self):
        return list(set([device.flaws for device in MaintenanceDevice.objects.filter(deleted=False)]))
    
    @property
    def spareparts(self):
        
        all_spareparts = []
        
        for device in MaintenanceDevice.objects.filter(deleted=False):
            
            spareparts = [
                relation.sparepart.name for relation in device.spareparts.all()
            ]
            
            all_spareparts.extend(spareparts)
        
        return all_spareparts
    
    @property
    def notes(self):
        return list(set([device.notes for device in MaintenanceDevice.objects.filter(deleted=False)]))
    
    
class SparepartGetter(object):
    
    @property
    def data(self):
        
        data = {
            'names': self.names
        }
        
        return data
    
    @property
    def names(self):
        return list(set([device.name for device in Sparepart.objects.filter(deleted=False)]))
    

class DeviceArchiveGetter(object):
    
    @property
    def data(self):
        
        data = {
            'serials': self.serials,
            'companies': self.companies,
            'device_types': self.device_types
        }
        
        return data
        
    @property
    def serials(self):
        return list(set([device.inventory_device.serial_number for device in ArchiveDevice.objects.filter(deleted=False)]))
    
    @property
    def companies(self):
        return list(set([device.delivery_receipt.company_name for device in ArchiveDevice.objects.filter(deleted=False)]))
    
    @property
    def device_types(self):
        return list(set([device.inventory_device.device_type for device in ArchiveDevice.objects.filter(deleted=False)]))

    
class ExpensesGetter(object):
    
    @property
    def data(self):
        
        data = {
            'descriptions': self.descriptions
        }
        
        return data
    
    @property
    def descriptions(self):
        return list(set([expense.description for expense in Expense.objects.all()]))
    

class ReceiptGetter(object):
    
    def __init__(self, type_=None):
        
        self.type_ = type_
        
    def _data(self, type_):
        
        data = {
            'ids': self.get_ids(type_),
            'companies': self.get_companies(type_),
            'inner_reprs': self.get_representatives('inner'),
            'outer_reprs': self.get_representatives('outer')
        }
        
        if type_ == 'reception':
            companies = [receipt.company_name for receipt in ReceptionReceipt.objects.all()]
            
        elif type_ == 'delivery':
            companies = [receipt.company_name for receipt in DeliveryReceipt.objects.all()]
            
        data['companies'] = list(set(companies))
        
        return data
    
    @property
    def data(self):
        
        return self._data(self.type_)
    
    @staticmethod
    def get_ids(type_):
        
        if type_ == 'reception':
            ids = [str(receipt.id) for receipt in ReceptionReceipt.objects.all()]
            
        elif type_ == 'delivery':
            ids = [str(receipt.id) for receipt in DeliveryReceipt.objects.all()]
            
        return ids
        
    @staticmethod
    def get_companies(type_):
        
        # جيب الشركات من كل الفواتير
        if type_ == 'reception':
            companies = [
                receipt.company_name for receipt in ReceptionReceipt.objects.all()
            ] + [
                receipt.company_name for receipt in DeliveryReceipt.objects.all()
            ]
        
        # جيب الشركات م المخزن بس
        else:
            companies = [
                device.reception_receipt.company_name for device in InventoryDevice.objects.filter(deleted=False, delivered=False)
            ]
            
        return list(set((companies)))
    
    @staticmethod
    def get_types(type_):
        
        if type_ == 'reception':
            
            types = [
                device.device_type for device in InventoryDevice.objects.filter(deleted=False)
            ] + [
                device.inventory_device.device_type for device in ArchiveDevice.objects.filter(deleted=False)
            ]
            
        else:
            
            types = [
                device.device_type for device in InventoryDevice.objects.filter(deleted=False, delivered=False)
            ]
            
        types = list(set(types))
        
        return types
    
    @staticmethod
    def get_representatives(repr_type):
        
        if repr_type == 'inner':
            
            representatives = list(set(
                [
                    receipt.inner_representative for receipt in ReceptionReceipt.objects.all()
                ] + [
                    receipt.inner_representative for receipt in DeliveryReceipt.objects.all()
                ]
            ))
            
        else:
            
            representatives = list(set(
                [
                    receipt.outer_representative for receipt in ReceptionReceipt.objects.all()
                ] + [
                    receipt.outer_representative for receipt in DeliveryReceipt.objects.all()
                ]
            ))
        
        return representatives
