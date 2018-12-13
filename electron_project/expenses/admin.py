from django.contrib import admin

from .models import *

admin.site.register(Expense)
admin.site.register(DailyExpense)
admin.site.register(ExpenseCategory)
admin.site.register(Loan)