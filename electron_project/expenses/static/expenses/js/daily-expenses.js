var currentView = 'daily-expenses';

$(document).ready(function () {
    
    $('#expenses-submenu')
        .show()
        .children().children(':first').addClass('active');
    
    $('.extra-separator, #close-account').show();
    
});

$(document).on('keypress', '#daily-expenses-table tbody tr:last td.empty:nth-child(3), td.empty:nth-child(4), td.empty:nth-child(5)', function (e) {
    
    var cell = $(this),
        row = cell.parent(),
        serialNumber = cell.text(),
        key = e.which;
    
    if (key === 13) {
        
        var expense = row.children(':nth-child(3)'),
            revenue = row.children(':nth-child(4)'),
            description = row.children(':nth-child(5)');
        
        if (!description.text() || !(expense.text() || revenue.text())) {
            
            runFieldsRequiredNotification();
            
            cell.blur();
            
            return;
            
        }
        
        if ((expense.text() && !isNumeric(expense.text())) || (revenue.text() && !isNumeric(revenue.text()))) {
            
            if (expense.text()) {
                
                iziToast.error({
                    title: 'خطأ',
                    message: 'السحب يجب أن يكون رقميا',
                    position: 'topRight',
                    zindex: 99999
                });
                
            }
            
            else {
                
                iziToast.error({
                    title: 'خطأ',
                    message: 'الاضافة يجب أن يكون رقمية',
                    position: 'topRight',
                    zindex: 99999
                });
                
            }
            
            cell.blur();
            
            return;
            
        }
        
        var data = {
            description: description.text()
        }
        
        if (expense.text()) {
            data.balanceChange = '-' + expense.text();
        }
        
        else {
            data.balanceChange = revenue.text();
        }
        
        cell.blur();
        
        $.ajax({
            url: 'expenses/ajax/create-expense/',
            type: 'POST',
            
            data: data,
            
            success: function (data) {
                
                $('#current-balance-label').text(data.current_balance);
                
                var element = $('#daily-expenses-table tbody tr:last');
                
                // Setting date direction to LTR
                element.children('td[date-field-name=created]').attr('dir', 'ltr');
                
                // Adding and rendering backend-calculated fields
                $.each(data.expense, function (key, value) {
                    
                    if (key !== 'formatted_balance_change') {
                        element.children('td[data-field-name=' + key + ']').text(value);
                    }
                    
                });
                
                // Disabling editable cells
                element.children('td:nth-child(3), td:nth-child(4), td:nth-child(5)').attr('contenteditable', false).removeClass('empty');
                
                // Adding pk attr to new row
                element.attr('data-pk', data.expense.id);
                
                // Adding remove button
                element.children(':last').append('<img src="/static/images/remove.png" class="icon remove-expense-item" data-pk="' + data.expense.id + '">');
                
                // Add counter
                element.children(':nth-child(2)').text(element.parent().children().length);
                
                // Adding the new empty row
                element.after('<tr>' +
                                '<td></td><td></td>' +
                                '<td class="editable-locked empty expense-td" data-field-name="formatted_balance_change" data-input-type="number" data-sign="-" style="height:38px" contenteditable="true"></td>' +
                                '<td class="editable-locked empty revenue-td" data-field-name="formatted_balance_change" data-input-type="number" data-sign="+" contenteditable="true"></td>' +
                                '<td class="editable-locked empty" data-field-name="description" data-input-type="text" contenteditable="true"></td>' +
                                '<td data-field-name="created"></td>' +
                                '<td class="editable-locked empty" data-field-name="total_after_change" data-input-type="number"></td>' +
                                '<td></td></tr>'
                );
            },
            
            error: function (error) {
                
                generateAlerts(error);
                
                cell
                    .blur()
                    .html('');
            } 
        });
    }
});

$(document).on('input', '#daily-expenses-table tbody tr td:nth-child(3), #daily-expenses-table tbody tr td:nth-child(4)', function (e) {
    
    var cell = $(this),
        sign = cell.attr('data-sign');
    
    if (sign === '-') {
        cell.parent().children(':nth-child(4)').text('');
    }
    
    else {
        cell.parent().children(':nth-child(3)').text('');
    }
    
});

$(document).on('click', '.remove-expense-item', function (e) {
    
    var btn =$(this),
        row = btn.parent().parent(),
        pk = row.attr('data-pk');
    
    var deleteExpense = function () {
        
        $.ajax({
            url: 'expenses/ajax/delete-expense/',
            
            data: {
                pk: pk
            },
            
            success: function (data) {
                
                $('#current-balance-label').text(data.current_balance);
                
                row.fadeOut(function () {
                    $(this).remove();
                });
                
                var body = row.parent();
                
                $.each(data.totals, function (id, total) {
                    body.children('tr[data-pk=' + id + ']').children(':nth-child(7)').text(total);
                });
                
                setTimeout(function () {
                    reorderTableCounters('#daily-expenses-table tbody tr:not(:last)');
                }, 500);
                
            },
            
            error: generateAlerts
        });
    }
    
    executeAfterPassword(deleteExpense);
    
});

$(document).on('keypress', '.filter-expense, .filter-revenue', function (e) {
    
    var input = $(this),
        isExpenseInput = input.hasClass('filter-expense');
    
    if (isExpenseInput) {
        $('.filter-revenue').val('');
        
    } else {
        $('.filter-expense').val('');
    }
    
});

$(document).on('click', '#close-account', function (e) {
    
    $.ajax({
        url: 'expenses/ajax/close-account/',
        
        data: {
            
        },
        
        success: function (data) {
            
            $('#todays-closing-table').fadeIn();
            $("#todays-total-revenue").text(data.total_revenue);
            $("#todays-total-expenses").text(data.total_expenses);
            $("#todays-closing-time").text(data.closing_time);
            $("#todays-closing-total").text(data.closing_balance);
                        
        }
        
    });
});
