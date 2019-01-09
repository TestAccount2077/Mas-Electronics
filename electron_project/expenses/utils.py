from django.utils import timezone
from django.conf import settings
from django.db.models import Sum

import datetime
import pendulum


from abstract.models import App
from .models import *

from accounts.models import WorkerAccount

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
            
def close_account():
    
    daily_expense = DailyExpense.objects.get(date=timezone.now().date())
    
    app = App.objects.first()
    
    daily_expense.closing_balance = app.current_balance
    daily_expense.closing_time = timezone.now()
    daily_expense.closed = True
    daily_expense.save()
    
    return daily_expense

def get_formatted_loans():
    
    loans = {}
        
    for account in WorkerAccount.objects.all():
        user_loans = [loan.as_dict() for loan in Loan.objects.filter(name=account.username)]
        
        loans[account.username] = user_loans
        
    return loans

def create_expense(balance_change, description, category):
    
    if balance_change > 0:
        type_ = 'RV'

    else:
        type_ = 'EX'

    category = ExpenseCategory.objects.get(category_type=type_, name=category)

    expense_obj = Expense.objects.create(
        description=description,
        category=category,
        balance_change=balance_change,
        date=timezone.now().date()
    )

    app = App.objects.first()

    app.current_balance += balance_change
    app.save()

    expense_obj.total_after_change = app.current_balance
    expense_obj.save()
    
    return expense_obj

def get_totals(year, category_type):
    
    categories = [category for category in ExpenseCategory.objects.filter(category_type=category_type)]
    
    category_rows = []
    month_totals = {}
    
    for category in categories:
        
        data = {
            'name': category.name,
            'totals':  []
        }
        
        total = 0
        
        for month in range(1, 13):
            
            expenses = Expense.objects.filter(category=category, date__month=month, date__year=year)
            SUM = expenses.aggregate(SUM=Sum('balance_change'))['SUM'] or 0
            
            data[month] = SUM
            total += SUM
            data['totals'].append(SUM or '')
            
            if month_totals.get(month):
                month_totals[month] += SUM
                
            else:
                month_totals[month] = SUM
            
        data['total'] = total
        
        category_rows.append(data)
        
    absolute_total = sum(month_totals.values())
    
    return dict(
        absolute_total=absolute_total,
        category_rows=category_rows,
        month_totals=month_totals,
        year=year,
        prev_year=year - 1
    )
