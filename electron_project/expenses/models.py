from django.db import models
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.conf import settings

import pendulum


from abstract.models import TimeStampedModel, App


class Expense(TimeStampedModel):
    
    description = models.CharField(max_length=300)
    category = models.ForeignKey('ExpenseCategory', null=True, blank=True, related_name='expenses')
    balance_change = models.FloatField()
    total_after_change = models.FloatField(null=True, blank=True)
    
    date = models.DateField()
    
    def update_total_after_change(self, new_balance_change):
        
        self.total_after_change += -self.balance_change
                
        self.balance_change = new_balance_change
        self.total_after_change += new_balance_change
        
        self.save()
        
    def get_new_totals(self, old_balance_change):
        
        expenses = Expense.objects.filter(created__gt=self.created)
        
        totals = {
            self.id: self.total_after_change
        }
        
        for index, expense in enumerate(expenses):
            
            expense.total_after_change += self.balance_change - old_balance_change
            expense.save()
            
            totals[expense.id] = expense.total_after_change
            
            if index == expenses.count() - 1:
                
                app = App.objects.first()
                
                app.current_balance = expense.total_after_change
                app.save()
            
        return totals
    
    @property
    def formatted_balance_change(self):
        
        if self.balance_change < 0:
            return -1 * self.balance_change
        
        return self.balance_change
    
    def as_dict(self):
        
        data = {
            'id': self.id,
            'description': self.description,
            'category': getattr(self.category, 'name', ''),
            'balance_change': self.balance_change,
            'formatted_balance_change': self.formatted_balance_change,
            'total_after_change': self.total_after_change,
            'created': self.created.astimezone(pendulum.timezone(settings.TIME_ZONE)).strftime('%I:%M %p')
        }
        
        return data


class DailyExpense(TimeStampedModel):
    
    opening_balance = models.FloatField(null=True, blank=True)
    closing_balance = models.FloatField(null=True, blank=True)
    
    closed = models.BooleanField(default=False)
    date = models.DateField()
    closing_time = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        
        return str(self.date)
    
    def as_dict(self, **kwargs):
        
        data = {
            'id': self.id,
            'opening_balance': self.opening_balance,
            'closing_balance': self.closing_balance,
            'date': self.date.strftime('%d/%m/%Y'),
            
            'closed': self.closed
        }
        
        if kwargs.get('include_closing_data', False):
            
            closing_data = {
                'total_revenue': self.total_revenue,
                'total_expenses': self.total_expenses,
                'closing_time': self.closing_time.astimezone(pendulum.timezone(settings.TIME_ZONE)).strftime('%d/%m/%Y %I:%M %p') if self.closing_time else None
            }
            
            data.update(closing_data)
            
        if kwargs.get('include_expenses', False):
            
            data['expenses'] = [expense.as_dict() for expense in Expense.objects.filter(date=self.date)]
        
        return data
    
    @property
    def total_revenue(self):
        
        expenses = Expense.objects.filter(date=self.date)
        
        if expenses.exists():
            total_revenue = sum([expense.balance_change for expense in expenses if expense.balance_change > 0] or [0,])
            
            return float(total_revenue)
        
        return 0
        
    @property
    def total_expenses(self):
        
        expenses = Expense.objects.filter(date=self.date)
        
        if expenses.exists():
            total_expenses = -sum([expense.balance_change for expense in expenses if expense.balance_change < 0] or [0,])
            
            return float(total_expenses)
        
        return 0
    
    
class ExpenseCategory(TimeStampedModel):
    
    TYPES = (
        ('RV', 'اضافة'),
        ('EX', 'سحب')
    )
    
    name = models.CharField(max_length=100)
    category_type = models.CharField(max_length=2, choices=TYPES, default='RV')
    
    def as_dict(self):
        
        return {
            'id': self.id,
            'name': self.name,
            'type': self.category_type,
            'formatted_type': self.get_category_type_display()
        }
