var expenses;

$(document).ready(function () {
    
    $('#expenses-submenu')
        .show()
        .children().children(':nth-child(5)').addClass('active');
    
});

$(document).on('click', '#confirm-total-filter-btn', function () {
    
    var balance = $('#total-filter-balance').val(),
        description = $('#total-filter-description').val(),
        categoryType = $('#total-filter-category-type').val(),
        category = $('#total-filter-category').val(),
        from = $('#e-total-filter-from').val(),
        to = $('#e-total-filter-to').val();
    
    $.ajax({
        url: '../ajax/total-filter/',
        
        type: 'POST',
        
        data: {
            balance,
            description,
            categoryType,
            category,
            from,
            to
        },
        
        success: function (data) {
            
            $('#expense-total-filter-modal').modal('hide');
            
            var body = $('#total-filter-table tbody');
            
            body.empty();
            
            expenses = [];
            
            $.each(data.expenses, function (index, expense) {
                
                expenses.push(expense.id);
                
                var element = `
                    <tr>
                        <td></td>
                        <td>${ index + 1 }</td>
                        <td>${ expense.date }</td>
                        <td>${ expense.description }</td>
                        <td>${ expense.balance_change }</td>
                        <td>${ expense.category }</td>
                    </tr>`;
                
                body.append(element);
                
            });
            
            if (data.sum > 0) {
                var color = '#5cb85c';
            }
            
            else if (data.sum < 0) {
                var color = 'red';
            }
            
            else {
                var color = '';
            }
            $('#total-filter-sum-table tbody').html(`<tr><td style="color: ${ color }">${ data.sum }</td></tr>`);
            
        },
        
        error: generateAlerts
    });
});

$(document).on('click', '#total-filter-category-type', function () {
    
    var type = $(this).val();
    
    if (type === 'اضافة') {
        updateSelect(revenueCategories);
    
    } else {
        updateSelect(expenseCategories);
    }
    
});

function updateSelect(items) {
    
    var select = $('#total-filter-category');
    
    select.children().not(':first').remove();
    
    $.each(items, function (index, item) {
        
        var element = `<option value="${ item }">${ item }</option>`;
        select.append(element);
        
    });
    
}

$(document).on('click', '#total-filter-table thead th:last', function () {
    
    var carat = $(this).children(':first'),
        caratUp = $(this).children(':last');
    
    if (carat.is(':visible')) {
        var criteria = '-category';
    } else {
        var criteria = 'category';
    }
    
    $.ajax({
        url: '../ajax/sort-expenses/',
        
        type: 'POST',
        
        data: {
            expenses: JSON.stringify(expenses),
            criteria
        },
        
        success: function (data) {
            
            if (carat.is(':hidden') && caratUp.is(':hidden')) {
                carat.toggle();
            
            } else {
                carat.toggle();
                caratUp.toggle();
            }
            
            var body = $('#total-filter-table tbody');
            
            body.empty();
            
            $.each(data.expenses, function (index, expense) {
                
                var element = `
                    <tr>
                        <td></td>
                        <td>${ index + 1 }</td>
                        <td>${ expense.date }</td>
                        <td>${ expense.description }</td>
                        <td>${ expense.balance_change }</td>
                        <td>${ expense.category }</td>
                    </tr>`;
                
                body.append(element);
                
            });
        }
    })
});
