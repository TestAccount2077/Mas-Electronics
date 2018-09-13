from django.db import models

from abstract.models import TimeStampedModel, BaseReceipt


class ReceptionReceipt(BaseReceipt):
    
    def __str__(self):
        
        return self.company_name


class DeliveryReceipt(BaseReceipt):
    
    def __str__(self):
        
        return self.company_name

