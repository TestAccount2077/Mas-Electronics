from django.conf.urls import url, include
from django.contrib import admin
from .views import *

app_name = 'expenses'

urlpatterns = [
    
    # Regular URLs
    url(r'^daily-expenses/$', daily_expenses_view, name='daily_expenses_view'),
    url(r'^expense-archive/$', expense_archive_list, name='expense_archive_list'),
    url(r'^expense-archive/(?P<pk>[0-9]+)/$', expense_archive_detail, name='expense_archive_detail'),
    
    url(r'^loans/$', loans_view, name='loans_view'),
    
    # Ajax URLs
    url(r'ajax/create-expense/$', create_expense),
    url(r'ajax/update-expense/$', update_expense),
    url(r'ajax/delete-expense/$', delete_expense),
    
    url(r'ajax/filter-expenses/$', filter_expenses),
    url(r'ajax/close-account/$', close_account),
    
    url(r'^ajax/add-category/$', add_category),
    
    url(r'^ajax/create-loan/$', create_loan),
]
