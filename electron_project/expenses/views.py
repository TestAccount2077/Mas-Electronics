from django.shortcuts import render
from django.http import JsonResponse
from django.utils import timezone

from abstract.utils import get_date_filters, get_abstract_data

from . import utils

from django.views.decorators.csrf import csrf_exempt

from .models import *

def daily_expenses_view(request):
    
    data = get_abstract_data(view='daily-expenses')
    
    utils.close_old_days()
    
    data['expenses'] = Expense.objects.filter(date=timezone.now().date())
    
    return render(request, 'expenses/daily-expenses.html', context=data)

def expense_archive_list(request):
    
    data = get_abstract_data()
    
    data['daily_expenses'] = DailyExpense.objects.exclude(date=timezone.now().date())
    
    return render(request, 'expenses/expense-archive-list.html', context=data)

def expense_archive_detail(request, pk):
    
    data = get_abstract_data()
    
    expense = DailyExpense.objects.get(pk=pk)
    
    data['daily_expense'] = expense.as_dict(include_closing_data=True, include_expenses=True)

    return render(request, 'expenses/expense-archive-detail.html', context=data)

@csrf_exempt
def create_expense(request):
    
    if request.is_ajax():
        
        data = request.POST
        
        description = data['description']
        balance_change = float(data['balanceChange'])
        
        expense_obj = Expense.objects.create(
            description=description,
            balance_change=balance_change,
            date=timezone.now().date()
        )
        
        app = App.objects.first()
        
        app.current_balance += balance_change
        app.save()
        
        expense_obj.total_after_change = app.current_balance
        expense_obj.save()
        
        return JsonResponse({
            'expense': expense_obj.as_dict(),
            'current_balance': app.current_balance
        })
    
def delete_expense(request):
    
    if request.is_ajax():
        
        expense = Expense.objects.get(pk=request.GET['pk'])
        
        app = App.objects.first()
    
        expenses = Expense.objects.filter(created__gt=expense.created)

        totals = {}
        
        if expenses.exists():
            for index, exp in enumerate(expenses):

                exp.total_after_change -= expense.balance_change
                exp.save()

                totals[exp.id] =  exp.total_after_change

                if index == expenses.count() - 1:

                    app.current_balance = exp.total_after_change
                    app.save()
                    
        else:
            
            app.current_balance -= expense.balance_change
            app.save()
        
        expense.delete()
        
        return JsonResponse({
            'totals': totals,
            'current_balance': app.current_balance
        })

@csrf_exempt
def filter_expenses(request):
    
    if request.is_ajax():
        
        data = request.POST
        
        balance_change = data['balanceChange']
        description = data['description']
        from_ = data['from']
        to = data['to']
        total = data['total']
        
        all_expenses = Expense.objects.all()
        
        if balance_change:
            balance_change = float(balance_change)
            
            balance_filter = all_expenses.filter(balance_change=balance_change)
            
        else:
            balance_filter = all_expenses
            
        if description:
            description_filter = all_expenses.filter(description=description)
            
        else:
            description_filter = all_expenses
            
        date_filter = get_date_filters(from_, to, 'created__range', all_expenses, format_='%d/%m/%Y %I:%M %p')
        
        if total:
            total = float(total)
            
            total_filter = all_expenses.filter(total_after_change=total)
            
        else:
            total_filter = all_expenses
            
        all_expenses = set(all_expenses)
        
        all_filters = [
            
            balance_filter,
            description_filter,
            date_filter,
            total_filter
            
        ]
        
        all_filters = [frozenset(qs) for qs in all_filters]
        
        all_filters = list(all_expenses.intersection(*all_filters))
        
        all_filters.sort(key=lambda expense: expense.created)
        
        all_filters = [expense.as_dict() for expense in all_filters]
        
        return JsonResponse({
            'expenses': all_filters
        })
    
def close_account(request):
    
    if request.is_ajax():
        
        daily_expense = DailyExpense.objects.get(date=timezone.now().date())
        
        app = App.objects.first()
        
        daily_expense.closing_balance = app.current_balance
        daily_expense.closing_time = timezone.now()
        daily_expense.closed = True
        daily_expense.save()
        
        return JsonResponse(daily_expense.as_dict(include_closing_data=True))
    