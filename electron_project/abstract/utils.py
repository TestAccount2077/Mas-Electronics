from django.utils import timezone
from devices.models import *
from expenses.models import *

from abstract.models import App

def get_object_or_None(model, **kwargs):
    
    qs = model.objects.filter(**kwargs)
    
    if qs.exists():        
        if qs.count() == 1:
            return qs.first()
        
def get_date_filters(from_, to, field_name, all_objects, format_='%d/%m/%Y'):
    
    if from_:
        from_ = timezone.datetime.strptime(from_, format_)
        
        if to:
            to = timezone.datetime.strptime(to, format_)
            
        else:
            to = timezone.now()
            
        date_filters = all_objects.filter(
            **{
                field_name: (from_, to)
            }
        )
        
    elif to:
        
        from_ = timezone.datetime(2000, 1, 1)
        to = timezone.datetime.strptime(to, format_)

        date_filters = all_objects.filter(
            **{
                field_name: (from_, to)
            }
        )
        
    else:
        date_filters = all_objects
        
    return date_filters

def sort_table(table_id, criteria):
    
    if table_id == 'device-inventory-table':
        
        items = InventoryDevice.objects.filter(deleted=False, delivered=False)
        
        if criteria == 'company':
            items = items.order_by('reception_receipt__company_name', 'device_type')
            
        elif criteria == 'type':
            items = items.order_by('device_type', 'reception_receipt__company_name')
            
        elif criteria == 'date':
            items = items.order_by('entrance_date')
            
    elif table_id == 'maintenance-table':
        
        items = MaintenanceDevice.objects.filter(deleted=False)
        
        if criteria == 'company':
            
            items = items.order_by(
                'inventory_device__reception_receipt__company_name',
                'inventory_device__device_type'
            )
            
        elif criteria == 'type':
            
            items = items.order_by(
                'inventory_device__device_type',
                'inventory_device__reception_receipt__company_name'
            )
            
        elif criteria == 'date':
            
            items = items.order_by('inventory_device__entrance_date')
            
    elif table_id == 'device-archive-table':
        
        items = ArchiveDevice.objects.filter(deleted=False)
        
        if criteria == 'company':
            
            items = items.order_by(
                'inventory_device__reception_receipt__company_name',
                'inventory_device__device_type'
            )
            
        elif criteria == 'type':
            
            items = items.order_by(
                'inventory_device__device_type',
                'inventory_device__reception_receipt__company_name'
            )
            
        elif criteria == 'date':
            
            items = items.order_by('leave_date')
            
    elif table_id == 'sparepart-inventory-table':
        
        items = Sparepart.objects.filter(deleted=False)
        
        if criteria == 'type':
            
            items = items.order_by('name')
    
    return [item.as_dict() for item in items]

def get_abstract_data(view=None):
    
    todays_expense, created = DailyExpense.objects.get_or_create(date=timezone.now().date())
    
    app = App.objects.first()
    
    if created:
        
        todays_expense.opening_balance = app.current_balance
        todays_expense.save()
        
    data = {
        'opening_balance': todays_expense.opening_balance,
        'current_balance': app.current_balance
    }
        
    if view == 'daily-expenses':
        data['daily_expense'] = todays_expense.as_dict(include_closing_data=True)
        
    return data
    
    
