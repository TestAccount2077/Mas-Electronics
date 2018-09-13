from django.conf.urls import url, include
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    url(r'', include('abstract.urls')),
    url(r'', include('accounts.urls')),
    url(r'^admin/', admin.site.urls),
    url(r'home/', include('main.urls')),
    url(r'devices/', include('devices.urls')),
    url(r'receipts/', include('receipts.urls')),
    url(r'expenses/', include('expenses.urls')),
    url(r'attendance/', include('attendance.urls')),
]

urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
