import os, django
os.environ['DJANGO_SETTINGS_MODULE'] = 'electron_project.settings'
django.setup()

from django.conf import settings

from devices.models import *
from receipts.models import *
from expenses.models import *

from MyPackage import DB

import pickle, datetime, pendulum

tz = pendulum.timezone(settings.TIME_ZONE)

def remove_duplicate(iterable):
    
    new_list = []
    
    for item in iterable:
        if item not in new_list:
            new_list.append(item)
            
    return new_list


class APIConverter(object):
    
    def convert_all(self):
        
        self.convert_spareparts()
        self.convert_reception_receipts()
        self.convert_delivery_receipts()
        self.convert_expenses()
        
    def convert_spareparts(self):
        
        print('Converting Spareparts...')
        
        spareparts = DB.SparepartInventoryRecord.load_records()
        
        for DB_sparepart in spareparts:
            
            sparepart = Sparepart.objects.create(
                name=DB_sparepart.type_,
                count=DB_sparepart.qty,
                minimum_qty=DB_sparepart.minimum
            )
        
        print('Converting Spareparts: Done')
        
    def convert_reception_receipts(self):
        
        print('Converting Reception Receipts...')
        
        receipts = DB.ReceptionReceipt.load_records()
        
        for receipt in receipts:
            
            new_receipt = ReceptionReceipt.objects.create(
                date=receipt.date.replace(tzinfo=tz),
                company_name=receipt.company,
                inner_representative=receipt.inner_representative,
                outer_representative=receipt.outer_representative
            )
            
            new_receipt.created = receipt.created.replace(tzinfo=tz)
            new_receipt.save()
            
            assert receipt.id == new_receipt.id
            
            serials = remove_duplicate(receipt.items)
            
            for serial in serials:
                record = DB.DeviceInventoryRecord.get(serial_number=serial)
                
                if record:
                    device = InventoryDevice.objects.create(
                        
                        entrance_date=receipt.date.replace(tzinfo=tz),
                        reception_receipt=new_receipt,
                        
                        serial_number=serial,
                        device_type=record.type_
                        
                    )
                    
                    device.created = receipt.created.replace(tzinfo=tz)
                    device.save()
                    
                    maintenance_records = DB.MaintenanceRecord.filter(
                        serial_number=serial,
                        company=receipt.company,
                        type_=record.type_,
                        date=record.date
                    )
                    
                    if len(maintenance_records) == 1:
                        
                        maintenance_record = maintenance_records[0]
                        
                        maintenance_device = MaintenanceDevice.objects.create(
                            
                            inventory_device=device,
                            
                            assignee=maintenance_record.assignee,
                            flaws=maintenance_record.flaw,
                            sparepart_count=maintenance_record.sparepart_qty,
                            notes=maintenance_record.notes
                            
                        )
                        
                        if maintenance_record.sparepart_changed:
                            sparepart=Sparepart.objects.filter(name=maintenance_record.sparepart_changed)
                            
                            if sparepart.exists():
                                maintenance_device.sparepart = sparepart.first()
                        
                        maintenance_device.created = maintenance_record.created.replace(tzinfo=tz)
                        maintenance_device.save()
        
        print('Converting Reception Receipts: Done')
        
    def convert_delivery_receipts(self):
        
        print('Converting Delivery Receipts...')
        
        records = DB.ArchiveRecord.load_records()
        
        for record in records:
            
            device = ArchiveDevice(
                
                created=record.created.replace(tzinfo=tz),
                leave_date=record.exit_date.replace(tzinfo=tz)
                
            )
            
            reception_receipt = ReceptionReceipt.objects.get(id=record.reception_receipt.id)
            
            if hasattr(record, 'delivery_receipt'):
                DB_delivery_receipt = record.delivery_receipt
                delivery_receipt = DeliveryReceipt.objects.filter(created=record.delivery_receipt.created.replace(tzinfo=tz))
                
            else:
                
                ten_secs_ago = datetime.timedelta(seconds=-10)
                ten_secs_later = datetime.timedelta(seconds=10)
                
                range_from = record.created + ten_secs_ago
                range_to = record.created + ten_secs_later
                
                delivery_receipts = DB.DeliveryReceipt.load_records()
                
                DB_delivery_receipt = list(filter(
                    lambda receipt: range_from < receipt.created < range_to, delivery_receipts
                ))[0]
                
                delivery_receipt = DeliveryReceipt.objects.filter(created=DB_delivery_receipt.created.replace(tzinfo=tz))
            
            if delivery_receipt.exists():
                delivery_receipt = delivery_receipt.first()
                
            else:
                
                delivery_receipt = DeliveryReceipt.objects.create(
                    date=DB_delivery_receipt.date.replace(tzinfo=tz),
                    company_name=DB_delivery_receipt.company,
                    inner_representative=DB_delivery_receipt.inner_representative,
                    outer_representative=DB_delivery_receipt.outer_representative
                )
                
                delivery_receipt.created = DB_delivery_receipt.created.replace(tzinfo=tz)
                delivery_receipt.save()
            
            device.leave_date = delivery_receipt.created
            device.delivery_receipt = delivery_receipt
            
            inventory_device = reception_receipt.devices.filter(serial_number=record.serial_number)
            
            if inventory_device.exists():
                
                inventory_device.update(delivered=True)
                
                inventory_device = inventory_device.first()
                
                if hasattr(inventory_device, 'maintenance_device'):
                    inventory_device.maintenance_device.delete()
                
            else:
                
                DB_reception_receipt = DB.ReceptionReceipt.get(id=reception_receipt.id)
                
                inventory_device = InventoryDevice.objects.create(
                    
                    reception_receipt=reception_receipt,
                    
                    entrance_date=DB_reception_receipt.date.replace(tzinfo=tz),
                    
                    serial_number=record.serial_number,
                    device_type=record.type_,
                    delivered=True
                    
                )
                
                inventory_device.created = reception_receipt.created
                inventory_device.save()
            
            device.inventory_device = inventory_device
            
            device.save()
        
        print('Converting Delivery Receipts: Done')


        
    def convert_expenses(self):
        
        print('Converting Expenses...')
        
        daily_expenses = DB.DailyExpenseRecord.load_records()
        items = DB.ExpenseRecord.load_records()
        
        matching = 0
        non_matching = 0
        
        for expense in daily_expenses:
            
            # Filtering items for that day
            expense_items = list(filter(lambda item: item.date.date() == expense.date.date(), items))
            expense_items.sort(key=lambda item: item.created)
            
            total_revenue = sum([item.balance_change for item in expense_items if item.balance_change >= 0])
            total_expenses = sum([item.balance_change for item in expense_items if item.balance_change < 0])
            
            # Normalizing data
            expense.total_revenue = total_revenue
            expense.total_expenses = total_expenses
            expense.closing_balance = expense.starting_balance + total_revenue + total_expenses
            
            if not hasattr(expense, 'closing_time'):
                expense.closing_time = expense.date.replace(hour=16, minute=0)
                
            expense.closed = True
            
            if expense_items:
                expense.starting_balance = expense_items[0].total_after_change - expense_items[0].balance_change
                expense.closing_balance = expense_items[-1].total_after_change
            
            expense.save()
            
            daily_expense = DailyExpense.objects.create(
                opening_balance=expense.starting_balance,
                closing_balance=expense.closing_balance,
                closed=True,
                closing_time=expense.closing_time.replace(tzinfo=tz),
                date=expense.date.date()
            )
            
            daily_expense.created = expense.created.replace(tzinfo=tz)
            daily_expense.save()
            
        for item in items:
            
            expense = Expense.objects.create(
                description=item.cause,
                balance_change=item.balance_change,
                total_after_change=item.total_after_change,
                date=item.date.date()
            )
            
            expense.created = item.created.replace(tzinfo=tz)
            expense.save()
        
        print('Converting Expenses: Done')
        

converter = APIConverter()

converter.convert_all()
