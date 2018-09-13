/*global $, console*/

var expenseDetailDate,
    
    receiptDetailPk,
    receiptDetailType,
    
    receiptDetailOldCompany,
    receiptDetailOldType,
    
    currentlyEditedSerialInput,
    currentlyEditedSerial,
    receiptDetailNewSerial;

$(document).on('click', 'td[data-field-name=reception_receipt_id], td[data-field-name=delivery_receipt_id], a.receipt-link', function (e) {
    
    if ($(this).hasClass('receipt-link')) {
        var id = $(this).attr('data-pk');
    }
    
    else {
        var id = $(this).text();
    }
    
    if ($(this).attr('data-field-name') === 'reception_receipt_id' || $(this).attr('data-type') === 'reception') {
        var type = 'reception';
    }
    
    else {
        var type = 'delivery';
    }
    
    $.ajax({
        url: 'receipts/ajax/get-receipt/',
        
        data: {
            id: id,
            type: type
        },
        
        success: function (data) {
            
            receiptDetailPk = data.receipt.id;
            receiptDetailType = data.receipt.type;
                        
            $('#receipt-detail-id-label').text(data.receipt.id);
            $('#receipt-detail-type-label').text(data.receipt.type);
            $('#receipt-detail-company-label').text(data.receipt.company_name);
            $('#receipt-detail-date-label').text(data.receipt.date);
            
            $('#receipt-detail-outer-repr').text(data.receipt.outer_representative);
            $('#receipt-detail-inner-repr').text(data.receipt.inner_representative);
        }
    });
});

$(document).on('click', '.expense-archive-detail-link', function (e) {
    
    var btn = $(this),
        pk = btn.parent().parent().attr('data-pk');
    
    expenseDetailDate = btn.parent().parent().children(':first').text();
    
    $.ajax({
        url: 'expenses/ajax/get-expense-archive-detail/',
        
        data: {
            pk: pk
        },
        
        success: function (expense) {
                        
            var table = $('#expense-archive-detail-table'),
                body = table.children('tbody');
            
            body.empty();
            
            $.each(expense.expenses, function (index, exp) {
                
                var row = '<tr data-pk="' + exp.pk + '">';
                
                if (exp.balance_change < 0) {
                    row += '<td>' + exp.formatted_balance_change + '</td><td></td>';
                } else {
                    row += '<td></td><td>' + exp.formatted_balance_change + '</td>';
                }
                
                row += '<td>' + exp.description + '</td><td dir="ltr">' + exp.created + '</td>' +
                       '<td>' + exp.total_after_change + '</td></tr>';
                
                body.append(row);
            });
            
            $('#expense-archive-total-expenses').text(expense.total_expenses);
            $('#expense-archive-total-revenue').text(expense.total_revenue);
            $('#expense-archive-closing-time').text(expense.closing_time);
            $('#expense-archive-closing-total').text(expense.closing_balance);
        },
        
        error: generateAlerts
         
    });
});

$(document).on('click', '#logo', function (e) {
    
    var status = $('#sidebar').data('expanded');
    
    console.log(status);
    
    
});