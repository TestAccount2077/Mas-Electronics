import os, django
os.environ['DJANGO_SETTINGS_MODULE'] = 'electron_project.settings'
django.setup()

from receipts.models import *

reception_receipts = ReceptionReceipt.objects.all()
delivery_receipts = DeliveryReceipt.objects.all()

print('Reception Receipts: {}'.format(reception_receipts.count()))
print('Delivery Receipts: {}'.format(delivery_receipts.count()))

reception_receipts.delete()
delivery_receipts.delete()

print('Receipts successfully deleted.')