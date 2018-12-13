from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from rest_framework import status

from . import utils
from .models import App

from accounts.models import WorkerAccount


def sort_table(request):
    
    if request.is_ajax():
        
        table_id = request.GET['tableId']
        criteria = request.GET['criteria']
        
        items = utils.sort_table(table_id, criteria)
        
        return JsonResponse({'items': items})
    
@csrf_exempt
def change_password(request):
    
    if request.is_ajax():
        
        data = request.POST
        
        username = data['username']
        password = data['password']
        
        if username == 'admin':
            app = App.objects.first()
            app.password = password
            app.save()
            
        else:
            account = WorkerAccount.objects.get(username=username)
            account.password = password
            account.save()
            
        return JsonResponse({})
    
@csrf_exempt
def add_worker(request):
    
    if request.is_ajax():
        
        data = request.POST
        
        password = data['password']
        
        if WorkerAccount.objects.filter(password=password).exists():
            
            return JsonResponse(
                {
                    'error': 'هذا الرقم مستخدم بالفعل'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        WorkerAccount.objects.create(username=data['username'], password=data['password'])
        
        return JsonResponse({})
