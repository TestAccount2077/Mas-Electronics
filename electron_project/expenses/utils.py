from django.utils import timezone
from django.conf import settings

import datetime
import pendulum


from abstract.models import App
from .models import *

def update_daily_expense(expense=None):
    
    if not expense:
        expense = DailyExpense.objects.get(date=timezone.now().date())
        
    last_expense = Expense.objects.filter(date=expense.date).last()
    
    app = App.objects.first()
    
    expense.closing_balance = app.current_balance = last_expense.total_after_change
    
    app.save()
    expense.save()
    
    return app.current_balance, expense

def close_old_days():
    
    app = App.objects.first()
        
    for expense in DailyExpense.objects.exclude(date=timezone.now().date()):
        if not expense.closing_time:
            
            # Setting closing time
            time = datetime.time(23, 59, 0, tzinfo=pendulum.timezone(settings.TIME_ZONE))
            dt = datetime.datetime.combine(expense.date, time)
            
            expense.closed = True
            expense.closing_time = dt
            
            # Setting final total
            last_item = Expense.objects.filter(date=expense.date).last()
            
            if last_item:
                expense.closing_balance = last_item.total_after_change
                
            else:
                expense.closing_balance = app.current_balance
            
            expense.save()