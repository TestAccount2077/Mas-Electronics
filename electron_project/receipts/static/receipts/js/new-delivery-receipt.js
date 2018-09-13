var deliveryReceiptRowCount = 15;

$(document).ready(function () {
    
    $('#receipts-submenu')
        .show()
        .children().children(':last').addClass('active');
    
    // Companies
    $("#new-delivery-receipt-company").autocomplete({
        source: newDeliveryReceiptCompanies
    });
    
    // Types
    $('.new-delivery-cell[data-num=2]').autocomplete({
        source: newDeliveryReceiptTypes
    });
    
    // Inner representatives
    $('#new-delivery-receipt-inner-repr').autocomplete({
        source: innerReprs
    });
    
    // Outer representatives
    $('#new-delivery-receipt-outer-repr').autocomplete({
        source: outerReprs
    });
    
    $('#new-delivery-receipt-date').datetimepicker({
        format: 'DD/MM/YYYY'
    });
    
});