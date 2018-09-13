var receptionReceiptRowCount = 15;

$(document).ready(function () {
    
    $('#receipts-submenu')
        .show()
        .children().children(':first').addClass('active');
    
    // Companies
    $("#new-reception-receipt-company").autocomplete({
        source: newReceptionReceiptCompanies
    });
    
    // Types
    $('.new-reception-cell[data-num=2]').autocomplete({
        source: newReceptionReceiptTypes
    });
    
    // Inner representatives
    $('#new-reception-receipt-inner-repr').autocomplete({
        source: innerReprs
    });
    
    // Outer representatives
    $('#new-reception-receipt-outer-repr').autocomplete({
        source: outerReprs
    });
    
    $('#new-reception-receipt-date').datetimepicker({
        format: 'DD/MM/YYYY'
    });
    
});