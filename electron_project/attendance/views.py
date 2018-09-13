from django.shortcuts import render
from abstract.utils import get_abstract_data
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt

from .models import *


def daily_attendance_view(request):
    
    data = get_abstract_data()
    
    data['attendances'] = Attendance.objects.filter(date=timezone.now().date())
    
    return render(request, 'attendance/daily-attendance.html', context=data)

@csrf_exempt
def create_attendance(request):
    
    if request.is_ajax():
        
        data = request.POST
        
        attendance_time = timezone.datetime.strptime(data['attendanceTime'], '%I:%M')
        
        return JsonResponse({'attendance': attendance.as_dict()})
