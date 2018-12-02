var currentView = 'daily-expenses';

var categoryMenu = $('.category-menu');

$(document).ready(function () {
    
    $('#expenses-submenu')
        .show()
        .children().children(':first').addClass('active');
    
    $('.extra-separator, #close-account, #add-category').show();
    
});

$(document).on('keypress', '#daily-expenses-table tbody tr:last td.empty:nth-child(3), td.empty:nth-child(4), td.empty:nth-child(5), td.empty:nth-child(6)', function (e) {
    
    var cell = $(this),
        row = cell.parent(),
        serialNumber = cell.text(),
        key = e.which;
    
    if (key === 13) {
        
        var expense = row.children(':nth-child(3)'),
            revenue = row.children(':nth-child(4)'),
            description = row.children(':nth-child(5)'),
            category = row.children(':nth-child(6)');
        
        if (!description.text() || !(expense.text() || revenue.text()) || !category.text()) {
            
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
            description: description.text(),
            category: category.text()
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
                
                $('.category-menu').hide();
                
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
                element.children('td:nth-child(3), td:nth-child(4), td:nth-child(5), td:nth-child(6)').attr('contenteditable', false).removeClass('empty');
                
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
                                '<td class="editable-locked empty" data-field-name="description" data-input-type="text" contenteditable="true"></td><td class="editable-locked empty" data-field-name="category" data-input-type="text" contenteditable="true"></td>' +
                                '<td data-field-name="created"></td>' +
                                '<td class="editable-locked empty" data-field-name="total_after_change" data-input-type="number"></td>' +
                                '<td></td></tr>'
                );
                
                if (data.daily_expense) {
                    updateClosingTable(data.daily_expense);
                }
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
        cell.parent().children(':nth-child(4), :nth-child(6)').text('');
    }
    
    else {
        cell.parent().children(':nth-child(3), :nth-child(6)').text('');
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
                
                if (data.daily_expense) {
                    updateClosingTable(data.daily_expense);
                }
                
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
        
        success: function (data) {
            
            $('#todays-closing-table').fadeIn();
            $("#todays-total-revenue").text(data.total_revenue);
            $("#todays-total-expenses").text(data.total_expenses);
            $("#todays-closing-time").text(data.closing_time);
            $("#todays-closing-total").text(data.closing_balance);
                        
        }
        
    });
});

function updateClosingTable(expense) {
    
    $('#todays-total-expenses').text(expense.total_expenses);
    $('#todays-total-revenue').text(expense.total_revenue);
    $('#todays-closing-time').text(expense.closing_time);
    $('#todays-closing-total').text(expense.closing_balance);
    
}

$(document).on('click', '#confirm-add-category', function () {
    
    var name = $('#category-name').val(),
        type = $('#category-list').val();
    
    if (!name) {
        runFieldsRequiredNotification();
        return;
    }
    
    $.ajax({
        url: '../ajax/add-category/',
        type: 'POST',
        
        data: {
            name,
            type
        },
        
        success: function (category) {
            
            if (type === 'RV') {
                revenueCategories.push(category);
            }
            
            else {
                expenseCategories.push(category);
            }
            
            $('#add-category-modal').modal('hide');
            
            notify('success', 'تم اضافة النوع بنجاح');
            
        },
        error: generateAlerts
        
    });
});

var currentCell;

$(document).on('click', '#daily-expenses-table tbody tr td:nth-child(6)', function (event) {
    
    currentCell = $(this);
    
    var row = currentCell.parent();
    
    if (currentCell.hasClass('editable-locked') && !currentCell.hasClass('empty')) {
        return;
    }
    
    categoryMenu.empty();
    
    if (row.children(':nth-child(3)').text()) {
        
        $.each(expenseCategories, function (index, category) {
            categoryMenu.append(`<p>${ category.name }</p>`);
        });
        
    }
    
    else if (row.children(':nth-child(4)').text()) {
        
        $.each(revenueCategories, function (index, category) {
            categoryMenu.append(`<p>${ category.name }</p>`);
        });
        
    }
    
    categoryMenu
        .show()
        .css({
            'top': event.pageY + 10,
            'left': event.pageX - 410
        });
});

$(document).on('mouseenter', '.category-menu p', function () {
    
    var content = $(this).text(),
        row = currentCell.parent();
    
    row.children('td:nth-child(6)').text(content);
    
});

$(document).on('click', '.category-menu p', function () {
    
    currentCell.focus();
    categoryMenu.hide();
        
});

$(document).on('keyup', '#daily-expenses-table tbody tr:last td:nth-child(6)', function () {
    
    $(this).text('');
    
});