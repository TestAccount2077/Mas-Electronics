from django.contrib import admin

from .models import *

admin.site.register(InventoryDevice)
admin.site.register(MaintenanceDevice)
admin.site.register(ArchiveDevice)
admin.site.register(Sparepart)