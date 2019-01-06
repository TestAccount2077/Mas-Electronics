from django.shortcuts import render
from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Sum

from rest_framework import status

from . import utils
from .models import *

from accounts.models import WorkerAccount
from abstract.utils import get_date_filters, get_abstract_data

import datetime


def daily_expenses_view(request):
    
    data = get_abstract_data(view='daily-expenses')
    
    utils.close_old_days()
    
    data['expenses'] = Expense.objects.filter(date=timezone.now().date())
    data['revenue_categories'] = [category.as_dict() for category in ExpenseCategory.objects.filter(category_type='RV')]
    data['expense_categories'] = [category.as_dict() for category in ExpenseCategory.objects.filter(category_type='EX')]
    
    return render(request, 'expenses/daily-expenses.html', context=data)

def expense_archive_list(request):
    
    data = get_abstract_data()
    
    data['daily_expenses'] = DailyExpense.objects.exclude(date=timezone.now().date())
    
    return render(request, 'expenses/expense-archive-list.html', context=data)

def expense_archive_detail(request, pk):
    
    data = get_abstract_data()
    
    expense = DailyExpense.objects.get(pk=pk)
    
    data['daily_expense'] = expense.as_dict(include_closing_data=True, include_expenses=True)
    data['revenue_categories'] = [category.as_dict() for category in ExpenseCategory.objects.filter(category_type='RV')]
    data['expense_categories'] = [category.as_dict() for category in ExpenseCategory.objects.filter(category_type='EX')]
    
    data.update(
        next_id=getattr(expense.get_next(), 'id', expense.id),
        prev_id=getattr(expense.get_prev(), 'id', expense.id)
    )
    
    return render(request, 'expenses/expense-archive-detail.html', context=data)

@csrf_exempt
def create_expense(request):
    
    if request.is_ajax():
        
        data = request.POST
                
        expense_obj = utils.create_expense(float(data['balanceChange']), data['description'], data['category'])
        
        context = {
            'expense': expense_obj.as_dict(),
            'current_balance': App.objects.first().current_balance
        }
        
        daily_expense = DailyExpense.objects.get(date=expense_obj.date)
        
        if daily_expense.closed:
            daily_expense = utils.close_account()
            context['daily_expense'] = daily_expense.as_dict(include_closing_data=True)
        
        return JsonResponse(context)

@csrf_exempt
def update_expense(request):
    
    if request.is_ajax():
        
        data = request.POST
        
        expense = Expense.objects.get(id=data['itemId'])
        
        type_ = 'RV' if expense.balance_change > 0 else 'EX'
        
        value = data['value']
        
        if value:
            category = ExpenseCategory.objects.get(name=data['value'], category_type=type_)
        else:
            category = None
            
        expense.category = category
        expense.save()
        
        return JsonResponse({})
    
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
        
        context = {
            'totals': totals,
            'current_balance': app.current_balance
        }
        
        daily_expense = DailyExpense.objects.get(date=expense.date)
        
        expense.delete()
        
        if daily_expense.closed:
            daily_expense = utils.close_account()
            context['daily_expense'] = daily_expense.as_dict(include_closing_data=True)
                
        return JsonResponse(context)

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
        
        daily_expense = utils.close_account()
        
        return JsonResponse(daily_expense.as_dict(include_closing_data=True))

@csrf_exempt
def add_category(request):
    
    if request.is_ajax():
        
        data = request.POST
        
        name = data['name']
        type_ = data['type']
        
        exists = ExpenseCategory.objects.filter(name=name, category_type=type_).exists()
        
        if exists:
            
            return JsonResponse(
                {
                    'error': 'هذا النوع موجود بالفعل'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        category = ExpenseCategory.objects.create(
            name=name,
            category_type=type_
        )
        
        return JsonResponse(category.as_dict())
    
def loans_view(request):
    
    data = get_abstract_data()
    
    loans = utils.get_formatted_loans()
    
    total_loans = sum([loan.amount for loan in Loan.objects.all()])
    
    if total_loans > 0:
        label = 'اجمالى المستحقات: {} جم'.format(total_loans)
        
    else:
        label = 'اجمالى السلف: {} جم'.format(total_loans)
    
    data.update(
        loans=loans,
        total_loans_label=label
    )
    
    return render(request, 'expenses/loans.html', context=data)

@csrf_exempt
def create_loan(request):
    
    if request.is_ajax():
        
        data = request.POST
        
        amount = float(data['amount'])
        name = data['name']
        
        if amount > 0:
            type_ = 'سداد سلفة'
            category = 'سلف'
            
        else:
            type_ = 'سلفة'
            category = 'سلف'
        
        expense = utils.create_expense(amount, '{} {}'.format(type_, name), category=category)
                
        loan = Loan.objects.create(
            name=name,
            amount=amount,
            notes=data['notes'],
            expense=expense
        )
        
        total_loans = Loan.objects.aggregate(total=Sum('amount'))['total']
        
        total_personal_loans = Loan.objects.filter(
            name=name
        
        ).aggregate(
            total=Sum('amount')
        )['total']
        
        if total_loans > 0:
            label = 'اجمالى المستحقات: {} جم'.format(total_loans)

        else:
            label = 'اجمالى السلف: {} جم'.format(total_loans)
        
        return JsonResponse(
            {
                'loan': loan.as_dict(include_sum=True),
                'current_balance': App.objects.first().current_balance,
                'total_loans_label': label,
                'total_personal_loans': total_personal_loans
            }
        )

def total_filter_view(request):
    
    data = get_abstract_data()
    
    data.update(
        
        revenue_categories=[
            category.name for category in ExpenseCategory.objects.filter(category_type='RV')
        ],
        
        expense_categories=[
            category.name for category in ExpenseCategory.objects.filter(category_type='EX')
        ]
    )
    
    return render(request, 'expenses/total-filter.html', context=data)

@csrf_exempt
def total_filter(request):
    
    if request.is_ajax():
        
        TYPES = {
            'اضافة': 'RV',
            'سحب': 'EX'
        }
        
        data = request.POST
        
        balance = data['balance']
        description = data['description']
        Type = data['categoryType']
        category = data['category']
        From = data['from']
        to = data['to']
        
        expenses = Expense.objects.filter(category__category_type=TYPES[Type])
        
        if balance:
            balance = float(balance)
            expenses = expenses.filter(balance_change=balance)
            
        expenses = expenses.filter(description__icontains=description)
        
        if category:
            expenses = expenses.filter(category__name=category)
        
        if From:
            pattern = '%d/%m/%Y'
            From = datetime.datetime.strptime(From, pattern)
            
            if to:
                to = datetime.datetime.strptime(to, pattern)
                
                expenses = expenses.filter(date__range=(From, to))
                
            else:
                expenses = expenses.filter(date__gte=From)
                
        else:
            if to:
                to = datetime.datetime.strptime(to, pattern)
                
                expenses = expenses.filter(date__lte=to)
                
        total_sum = expenses.aggregate(SUM=Sum('balance_change'))['SUM'] or 0.0
                
        expenses = [expense.as_dict() for expense in expenses]
        
        return JsonResponse({
            'expenses': expenses,
            'sum': total_sum
        })
