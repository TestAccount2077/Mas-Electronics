const table = $('#loans-table');
var currUser;
var foot = $('#loans-table tfoot tr:last');

var currentView = 'loans';

$(document).ready(function () {
    
    $('#expenses-submenu')
        .show()
        .children().children(':nth-child(3)').addClass('active');
    
});

$(document).on('click', '#loan-employee-container p', function () {
    
    currUser = $(this).text();
    
    var tab = $(this);
    
    tab.siblings(':not(:last)').removeClass('active');
    tab.addClass('active');
    
    var Loans = loans[currUser],
        body = $('#loans-table tbody');
    
    body.empty();
    
    var total = 0;
    
    $.each(Loans, function (index, loan) {
        
        var element = generateLoanElement(loan);
        body.append(element);
        total += loan.amount;
    });
    
    updateLoanLabels(Loans);
    
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

$(document).on('keypress', '#loans-table tbody tr:last td:first, #loans-table tbody tr:last td:nth-child(2), #loans-table tbody tr:last td:last', function (e) {
        
    if (e.which === 13) {
        
        var loan = $('#loans-table tbody tr:last td:first').text(),
            refund = $('#loans-table tbody tr:last td:nth-child(2)').text(),
            notes = $('#loans-table tbody tr:last td:last').text();
        
        if (!loan && !refund) {
            
            runFieldsRequiredNotification();
            return;
            
        }
        
        if ((loan && !isNumeric(loan)) || (refund && !isNumeric(refund))) {
            
            iziToast.error({
                title: 'خطأ',
                message: 'السحب والاضافة يجب أن تكون رقمية',
                position: 'topRight',
                zindex: 99999
            });
            
            return;
            
        }
        
        $.ajax({
            url: '../ajax/create-loan/',
            type: 'POST',
            
            data: {
                name: currUser,
                amount: -Number.parseFloat(loan) || refund,
                notes
            },
            
            success: function (data) {
                
                iziToast.success({
                    title: 'نجاح',
                    message: 'تمت الاضافة بنجاح',
                    position: 'topRight',
                    zindex: 99999
                });
                
                var element = generateLoanElement(data.loan),
                    lastRow = $('#loans-table tbody tr:last');
                
                loans[currUser].push(data.loan);
                
                lastRow.before(element);
                
                lastRow.children().each(function () {
                    $(this).text('');
                });
                
                $('#current-balance-label').text(data.current_balance);
                
                $('#total-loans-label').text(data.total_loans_label);
                
                updateLoanLabels();
                updatePersonalLabel(data.total_personal_loans);
                
            },
            
            error: generateAlerts
        });
    }
});

function generateLoanElement(loan) {
    
    if (loan.amount > 0) {

        var element = `
            <tr>
                <td data-num="1"></td>
                <td data-num="2">${ loan.amount }</td>`;
    }

    else {

        var element = `
            <tr>
                <td data-num="1">${ -loan.amount }</td>
                <td data-num="2"></td>`;
    }

    element += `
        <td dir="ltr">${ loan.created }</td>
        <td>${ loan.notes }</td>
    <tr>`;
    
    return element;
    
}

function updateLoanLabels(Loans) {
    
    if (!Loans) {
        var Loans = loans[currUser];
    }
    
    var totalExpenses = 0,
        totalRevenue = 0;
    
    $.each(Loans, function (index, loan) {
        
        if (loan.amount > 0) {
            totalRevenue += loan.amount;
        } else {
            totalExpenses += -loan.amount;
        }
        
    });
    
    foot.show();
    foot.children(':first').text(totalExpenses);
    foot.children(':nth-child(2)').text(totalRevenue);
    
}

$(document).on('keypress', '#loans-table tbody tr:last td:first, #loans-table tbody tr:last td:nth-child(2)', function () {
    
    if ($(this).data('num') === 1) {
        $('#loans-table tbody tr:last td:nth-child(2)').text('');
    }
    
    else {
        $('#loans-table tbody tr:last td:first').text('');
    }
    
});

function updatePersonalLabel(total) {
    
    if (total > 0) {
        var personalLabel = `اجمالى المستحقات: ${total} جم`,
            color = 'green';
    }
    
    else if (total === 0) {
        var personalLabel = `اجمالى السلف: ${-total} جم`,
            color = 'black';
    }
    
    else {
        var personalLabel = `اجمالى السلف: ${-total} جم`,
            color = 'red';
    }
    
    $('#total-personal-loans-label')
        .css('color', color)
        .text(personalLabel);
    
}
