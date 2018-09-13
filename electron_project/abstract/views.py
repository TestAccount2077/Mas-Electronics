from django.shortcuts import render
from django.http import JsonResponse

from . import utils


def sort_table(request):
    
    if request.is_ajax():
        
        table_id = request.GET['tableId']
        criteria = request.GET['criteria']
        
        items = utils.sort_table(table_id, criteria)
        
        return JsonResponse({'items': items})