from devices.models import *
from expenses.models import *
from expenses import utils as expenses_utils

def update_cell_content(pk, item_type, field_name, content):
    
    changes = {}
    
    if item_type == 'maintenance':
        
        inventory_device_fields = ('serial_number', 'company_name', 'device_type', 'entrance_date')
        
        device = MaintenanceDevice.objects.filter(pk=pk)
        
        if field_name in inventory_device_fields:
            
            data = {
                field_name: content
            }
            
            device.update(**data)
        
        elif field_name == 'sparepart_count':
            
            device = device.first()
            new_count = int(content) if content else 0
            sparepart = device.sparepart
            
            if new_count == device.sparepart_count:
                return True, changes
            
            if sparepart:
                if device.sparepart_count:
                    sparepart.count += device.sparepart_count
                
                if new_count > sparepart.count:
                    
                    return True, {
                        'invalid': True,
                        'sparepart_count_max_reached': 'لا توجد قطع غيار كافية من هذا النوع',
                        'count': device.sparepart_count
                    }
                
                sparepart.count -= new_count
                
                sparepart.save()
                
                changes['spareparts'] = [sparepart.as_dict(),]
                
            device.sparepart_count = new_count
            device.save()
            
        elif field_name == 'sparepart_name':
            
            device = device.first()
            
            # Checking if new sparepart exists
            if content:
                new_sparepart = Sparepart.objects.filter(name=content, deleted=False)
            
                if not new_sparepart.exists():
                    return False, {'sparepart_does_not_exist': 'قطعة الغيار هذه غير موجودة'}
            
            old_sparepart = device.sparepart
            
            if content:
                
                new_sparepart = new_sparepart.first()
                
                # Checking if not changes were made
                if new_sparepart == old_sparepart:
                    return True, changes
                
                # Checking if new count is more than sparepart count
                if device.sparepart_count:
                    if device.sparepart_count > new_sparepart.count:
                        
                        return True, {
                            'invalid': True,
                            'sparepart_count_max_reached': 'لا توجد قطع غيار كافية من هذا النوع',
                            'count': device.sparepart_count
                        }
                
                if old_sparepart:
                    if device.sparepart_count:
                        
                        count = device.sparepart_count
                        
                        old_sparepart.count += count
                        old_sparepart.save()
                        
                        new_sparepart.count -= count
                        new_sparepart.save()
                    
                    device.sparepart = new_sparepart
                    device.save()
                    
                    changes['spareparts'] = [new_sparepart.as_dict(), old_sparepart.as_dict()]
                    
                else:
                    
                    if device.sparepart_count:
                        
                        new_sparepart.count -= device.sparepart_count
                        new_sparepart.save()
                    
                    device.sparepart = new_sparepart
                    device.save()
                    
                    changes['spareparts'] = [new_sparepart.as_dict(),]
                    
            else:
                if device.sparepart_count:
                    
                    old_sparepart.count += device.sparepart_count
                    old_sparepart.save()
                    
                    changes['spareparts'] = [old_sparepart.as_dict(),]
                
                device.sparepart = None
                device.save()
        
        else:
            
            if field_name != 'sparepart_name':

                data = {
                    field_name: content
                }

                device.update(**data)
            
    elif item_type == 'sparepart':
        
        sparepart_qs = Sparepart.objects.filter(pk=pk)
        sparepart = sparepart_qs.first()
        
        if field_name == 'name':
            sparepart.name = content
            sparepart.save()
            
        else:
            data = {
                field_name: content
            }
            
            sparepart_qs.update(**data)
            
            sparepart = sparepart_qs.first()
            
            changes['count_lt_minimum'] = sparepart.count < sparepart.minimum_qty
            
    elif item_type == 'expense':
        
        expense = Expense.objects.get(pk=pk)
        
        if field_name == 'formatted_balance_change':
            
            new_balance_change = float(content)
            
            old_balance_change = expense.balance_change
            
            if new_balance_change == old_balance_change:
                return True, changes
            
            expense.update_total_after_change(new_balance_change)
            
            changes['new_totals'] = expense.get_new_totals(old_balance_change)
            
            changes['current_balance'], daily_expense = expenses_utils.update_daily_expense()
            
            if daily_expense.closed:
                daily_expense = expenses_utils.close_account()
            
            changes['daily_expense'] = daily_expense.as_dict(include_closing_data=True)
            
        elif field_name == 'description':
            
            expense.description = content
            expense.save()
        
    return True, changes

def get_receipts_data(receipt_type, data_type):
    
    inventory_devices = InventoryDevice.objects.filter(deleted=False)
    archive_devices = ArchiveDevice.objects.filter(deleted=False)
    
    if receipt_type == 'reception':
        if data_type == 'serial':
            data = list(set([device.inventory_device.serial_number for device in archive_devices]))
        
    else:
        if data_type == 'serial':
            data = list(set([device.serial_number for device in inventory_devices]))
    
    if data_type == 'company':
        
        inventory_device_companies = [device.reception_receipt.company_name for device in inventory_devices]
        
        archive_device_companies = [device.delivery_receipt.company_name for device in archive_devices]
        
        if not (inventory_device_companies and archive_device_companies):
            data = set(inventory_device_companies).union(set(archive_device_companies))
            
        else:
            
            data = set(inventory_device_companies + archive_device_companies)
        
        data = list(data)
        
    elif data_type == 'device_type':
        
        inventory_device_types = [device.device_type for device in inventory_devices]
        archive_device_types = [device.inventory_device.device_type for device in archive_devices]
        
        if not (inventory_device_types and archive_device_types):
            data = set(inventory_device_types).union(set(archive_device_types))
            
        else:
            data = set(inventory_device_types + archive_device_types)
        
        data = list(data)
            
    return data
