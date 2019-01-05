var categoryMenu = $('.category-menu'),
    currentCell;


$(document).on('click', '#expense-archive-detail-table tbody tr td:nth-child(6)', function (event) {
    
    currentCell = $(this);
    
    var row = currentCell.parent();
    
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

$(document).on('focusout', '#expense-archive-detail-table tbody tr td:nth-child(6)', function () {
    
    var cell = $(this),
        value = cell.text(),
        itemId = cell.parent().data('pk');
    
    $.ajax({
        url: '../ajax/update-expense/',
        type: 'POST',
        
        data: {
            value,
            itemId
        },
        success: function (data) {
            
        },
        error: generateAlerts
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

$(document).on('keyup', '#expense-archive-detail-table tbody tr td:nth-child(6)', function () {
    
    $(this).text('');
    
});