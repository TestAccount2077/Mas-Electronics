var categoryType = 'EX',
    body = $('#expense-totals-table tbody');

$(document).ready(function () {
    
    $('#expenses-submenu')
        .show()
        .children().children(':nth-child(5)').addClass('active');
    
});

$(document).on('click', '.arrow-btn', function () {
    
    var dir = $(this).data('dir');
    
    dir === 'left' ? Year-- : Year++;
    
    getYear(Year);
    
});

function getYear(year) {
    
    $.ajax({
        
        url: '../ajax/get-totals-year/',
        
        data: {
            year,
            categoryType
        },
        
        success: function (data) {
            
            body.empty();
            
            $('#year-header').text(Year);
            
            $.each(data.category_rows, function (index, category) {
                
                var row = `<tr><td>${ category.name }`;
                
                $.each(category.totals, function (index, total) {
                    row += `<td>${ total }</td>`;
                });
                
                row += `<td>${ category.total }</td></tr>`;
                
                body.append(row);
                
            });
            
            row = '<tr><td>الاجمالى</td>';
            
            $.each(data.month_totals, function (month, total) {
                row += `<td>${ total }</td>`;
            });
            
            row += `<td><b>${ data.absolute_total }</b></td></tr>`;
            
            body.append(row);
            
        },
        
        error: generateAlerts
    });
}

$(document).on('click', '#category-type', function () {
    
    categoryType = $('#category-type').is(':checked') ? 'RV' : 'EX';
    getYear(Year);
    
});
