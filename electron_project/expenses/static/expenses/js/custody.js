const table = $('#custs-table');
var currUser;
var foot = $('#custs-table tfoot tr:last');

var currentView = 'custs';

$(document).ready(function () {
    
    $('#expenses-submenu')
        .show()
        .children().children(':nth-child(4)').addClass('active');
    
});

$(document).on('click', '#cust-employee-container p', function () {
    
    currUser = $(this).text();
    
    var tab = $(this);
    
    tab.siblings(':not(:last)').removeClass('active');
    tab.addClass('active');
    
    var Custs = custs[currUser],
        body = $('#custs-table tbody');
    
    body.empty();
    
    var total = 0;
    
    $.each(Custs, function (index, cust) {
        
        var element = generateCustElement(cust);
        body.append(element);
        total += cust.amount;
    });
    
    updateCustLabels(Custs);
    
    body.append(`
        <tr>
            <td contenteditable='true' data-num='1'></td>
            <td contenteditable='true' data-num='2'></td>
            <td></td>
            <td contenteditable='true'></td>
        </tr>
    `);
    
    updatePersonalLabel(total);
});

$(document).on('keypress', '#custs-table tbody tr:last td:first, #custs-table tbody tr:last td:nth-child(2), #custs-table tbody tr:last td:last', function (e) {
        
    if (e.which === 13) {
        
        var cust = $('#custs-table tbody tr:last td:first').text(),
            refund = $('#custs-table tbody tr:last td:nth-child(2)').text(),
            notes = $('#custs-table tbody tr:last td:last').text();
        
        if (!cust && !refund) {
            
            runFieldsRequiredNotification();
            return;
            
        }
        
        if ((cust && !isNumeric(cust)) || (refund && !isNumeric(refund))) {
            
            iziToast.error({
                title: 'خطأ',
                message: 'السحب والاضافة يجب أن تكون رقمية',
                position: 'topRight',
                zindex: 99999
            });
            
            return;
            
        }
        
        $.ajax({
            
            url: '../ajax/create-custody/',
            
            type: 'POST',
            
            data: {
                name: currUser,
                amount: -Number.parseFloat(cust) || refund,
                notes
            },
            
            success: function (data) {
                
                iziToast.success({
                    title: 'نجاح',
                    message: 'تمت الاضافة بنجاح',
                    position: 'topRight',
                    zindex: 99999
                });
                
                var element = generateCustElement(data.cust),
                    lastRow = $('#custs-table tbody tr:last');
                
                custs[currUser].push(data.cust);
                
                lastRow.before(element);
                
                lastRow.children().each(function () {
                    $(this).text('');
                });
                
                $('#current-balance-label').text(data.current_balance);
                
                $('#total-custs-label').text(data.total_custs_label);
                
                updateCustLabels();
                updatePersonalLabel(data.total_personal_custs);
                
            },
            
            error: generateAlerts
        });
    }
});

function generateCustElement(cust) {
    
    if (cust.amount > 0) {

        var element = `
            <tr>
                <td data-num="1"></td>
                <td data-num="2">${ cust.amount }</td>`;
    }

    else {

        var element = `
            <tr>
                <td data-num="1">${ -cust.amount }</td>
                <td data-num="2"></td>`;
    }

    element += `
        <td dir="ltr">${ cust.created }</td>
        <td>${ cust.notes }</td>
    <tr>`;
    
    return element;
    
}

function updateCustLabels(Custs) {
    
    if (!Custs) {
        var Custs = custs[currUser];
    }
    
    var totalExpenses = 0,
        totalRevenue = 0;
    
    $.each(Custs, function (index, cust) {
        
        if (cust.amount > 0) {
            totalRevenue += cust.amount;
        
        } else {
            totalExpenses += -cust.amount;
        }
        
    });
    
    foot.show();
    foot.children(':first').text(totalExpenses);
    foot.children(':nth-child(2)').text(totalRevenue);
    
}

$(document).on('keypress', '#custs-table tbody tr:last td:first, #custs-table tbody tr:last td:nth-child(2)', function () {
    
    if ($(this).data('num') === 1) {
        $('#custs-table tbody tr:last td:nth-child(2)').text('');
    }
    
    else {
        $('#custs-table tbody tr:last td:first').text('');
    }
    
});

function updatePersonalLabel(total) {
    
    if (total > 0) {
        var personalLabel = `اجمالى المستحقات: ${total} جم`,
            color = 'green';
    }
    
    else if (total === 0) {
        var personalLabel = `اجمالى العهدة: ${-total} جم`,
            color = 'black';
    }
    
    else {
        var personalLabel = `اجمالى العهدة: ${-total} جم`,
            color = 'red';
    }
    
    $('#total-personal-custs-label')
        .css('color', color)
        .text(personalLabel);
    
}
