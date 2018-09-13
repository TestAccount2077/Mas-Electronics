function printReceipt(table, clearableInputs, newId, typeLabel) {
    
    var printedTable = $('#print-table'),
        body = table.children('tbody'),
        rowCount = body.children().length,
        currentRow = 1,
        currentTable = 1,
        tableCount = Math.ceil(rowCount / 15),
        pageNumberElement = $('#print-receipt-page-num');
    
    $('#print-receipt-num').text(newId);
    $('#receipt-type-label').text(typeLabel);
    
    var printedBody = printedTable.children('tbody');
    printedTable.children('thead').html(table.children('thead').html());
    
    var data = {
        newId: newId,
        typeLabel: typeLabel
    };
    
    prepareTableForPrint(tableCount, printedBody, pageNumberElement, currentRow, currentTable, body, 'receipt', data);
    /*
    for (var i = 1; i <= tableCount; i++) {
        
        printedBody.empty();
        
        pageNumberElement.text('(' + i + ')');
        
        for (var row=currentRow; row <= currentTable * 15; row++) {
            
            var originalTableRow = body.children('tr[data-row=' + currentRow + ']');
            
            printedBody.append(originalTableRow.clone());
            
            currentRow += 1;
        
        }
        
        print();
        
        currentTable += 1;
        
    }
    */
    body.children().children().each(function () {
        $(this).empty();
    });
    
    table.children('tbody').html(body.html());
    
    if (clearableInputs) {
        clearableInputs.each(function () {
            
            $(this).val('');
            
        });
    }
}

function prepareFilterModal() {
    
    var data = {
        type: currentView
    }
    
    if (currentView === 'device-inventory' || currentView === 'device-archive') {
        
        $('#filter-from').datetimepicker({
            format: 'DD/MM/YYYY'
        });
        
        $('#filter-to').datetimepicker({
            format: 'DD/MM/YYYY'
        });
        
        $.ajax({
            url: 'devices/ajax/get-autocomplete-data/',
            
            data: data,
            
            success: function (data) {
                
                $('#filter-serial').autocomplete({
                    source: data.serials
                });
                
                $('#filter-company').autocomplete({
                    source: data.companies
                });
                
                $('#filter-type').autocomplete({
                    source: data.device_types
                });
                
            }
        });
        
    }
    
    else if (currentView === 'maintenance') {
        
        $('#filter-from').datetimepicker({
            format: 'DD/MM/YYYY'
        });
        
        $('#filter-to').datetimepicker({
            format: 'DD/MM/YYYY'
        });
        
        $.ajax({
            url: 'devices/ajax/get-autocomplete-data/',
            
            data: data,
            
            success: function (data) {
                
                $('#filter-serial').autocomplete({
                    source: data.serials
                });
                
                $('#filter-company').autocomplete({
                    source: data.companies
                });
                
                $('#filter-type').autocomplete({
                    source: data.device_types
                });
                
                $('#filter-assignee').autocomplete({
                    source: data.assignees
                });
                
                $('#filter-flaws').autocomplete({
                    source: data.flaws
                });
                
                $('#filter-sparepart').autocomplete({
                    source: data.spareparts
                });
                
                $('#filter-notes').autocomplete({
                    source: data.notes
                });
                
            }
        });
    }
    
    else if (currentView === 'sparepart-inventory') {
        
        $.ajax({
            url: 'devices/ajax/get-autocomplete-data/',
            
            data: data,
            
            success: function (data) {
                
                $('#filter-name').autocomplete({
                    source: data.names
                });
                
            }
        });
    }
    
    else if (currentView.includes('receipt-archive')) {
        
        $('#filter-from').datetimepicker({
            format: 'DD/MM/YYYY'
        });
        
        $('#filter-to').datetimepicker({
            format: 'DD/MM/YYYY'
        });
        
        $.ajax({
            url: 'devices/ajax/get-autocomplete-data/',
            
            data: data,
            
            success: function (data) {
                
                $('#filter-id').autocomplete({
                    source: data.ids
                });
                
                $('#filter-company').autocomplete({
                    source: data.companies
                });
                
                $('#filter-inner-repr').autocomplete({
                    source: data.inner_reprs
                });
                
                $('#filter-outer-repr').autocomplete({
                    source: data.outer_reprs
                });
                
            }
        });
        
    }
    
    else if (currentView === 'daily-expenses' || currentView === 'expense-archive-detail') {
        
        data.type = 'expenses';
        
        $('#filter-from').datetimepicker({
            format: 'DD/MM/YYYY hh:mm a'
        });
        
        $('#filter-to').datetimepicker({
            format: 'DD/MM/YYYY hh:mm a'
        });
        
        $.ajax({
            url: 'devices/ajax/get-autocomplete-data/',
            
            data: data,
            
            success: function (data) {
                
                $('#filter-description').autocomplete({
                    source: data.descriptions
                });
                
            }
        });
    }
}

function prepareTableForPrint(tableCount, printedBody, pageNumberElement, currentRow, currentTable, body, type, data) {
    
    if (type === 'receipt') {
        
        var date = new Date(),
            date = ' ' + date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
        
        $('#receipt-type-label').text(data.typeLabel);
        $('#print-page-title').text('رقم: ' + data.newId);
        
        $('.reprs-section, .print-section-footer').show();
        
        if (currentView === 'receipt-detail') {
            $('#outer-repr-label').text($('#receipt-detail-outer-repr').text());
            $('#inner-repr-label').text($('#receipt-detail-inner-repr').text());
        }
        
    }
    
    else {
        
        var date = new Date(),
            date = ' ' + date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
        
        $('.reprs-section, .print-section-footer').hide();
        
        if (currentView === 'daily-expenses') {
            if ($("#todays-closing-table").is(':visible')) {
                $('#print-table').after($('#todays-closing-table').clone());
            }
        }
        
        else if (currentView === 'expense-archive-detail') {
            $('#print-table').after($('#expense-archive-closing-table').clone());
        }
    }
    
    $('#print-date-label').text(date);
    
    var bodyCopy = body.clone();
    
    body.children(':hidden').remove();
    
    for (var i = 1; i <= tableCount; i++) {
        
        printedBody.empty();
        
        pageNumberElement.text('(' + i + ')');
        
        for (var row=currentRow; row <= currentTable * 20; row++) {
            
            var originalTableRow = body.children(':nth-child(' + currentRow + ')');
            
            printedBody.append(originalTableRow.clone());
            
            currentRow += 1;
        
        }
        
        if (type === 'receipt') {
            $('.print-container').height(620);
        } else {
            $('.print-container').height(850);
        }
        
        print();
        
        $('#print-table').next().remove();
        
        currentTable += 1;
        
    }
    
    body.empty();
    body.html(bodyCopy.html());
    
}

function startTimer() {
    
    setInterval(function () {
        
        var date = new Date();
        
        if (date.getHours() === 12 && !noonUploadDone) {
            
            if (navigator.onLine) {
                
                iziToast.info({
                    title: '',
                    message: 'جار رفع البيانات',
                    position: 'topRight',
                    zindex: 99999
                });
                
                $.ajax({
                    url: '/ajax/upload-data/',
                    
                    success: function (data) {
                        
                        iziToast.success({
                            title: 'Success',
                            message: 'تم رفع البيانات بنجاح',
                            position: 'topRight',
                            zindex: 99999
                        });
                        
                    },
                    
                    error: function (error) {
                        
                        generateAlerts(error);
                        
                    }
                });
                
            } else {
            
                iziToast.error({
                    title: 'خطأ',
                    message: 'تعذر رفع البيانات. لا يتوفر اتصال بالانترنت',
                    position: 'topRight',
                    zindex: 99999
                });
                
            }
            
            noonUploadDone = true;
            
        }
        
        if (date.getHours() === 16 && !closingUploadDone) {
            
            if (navigator.onLine) {
                
                iziToast.info({
                    title: '',
                    message: 'جار رفع البيانات',
                    position: 'topRight',
                    zindex: 99999
                });
                
                $.ajax({
                    url: '/ajax/upload-data/',
                    
                    success: function (data) {
                        
                        iziToast.success({
                            title: 'Success',
                            message: 'تم رفع البيانات بنجاح',
                            position: 'topRight',
                            zindex: 99999
                        });
                        
                    },
                    
                    error: function (error) {
                        
                        generateAlerts(error);
                        
                    }
                });
                
            } else {
            
                iziToast.error({
                    title: 'خطأ',
                    message: 'تعذر رفع البيانات. لا يتوفر اتصال بالانترنت',
                    position: 'topRight',
                    zindex: 99999
                });

            }
            
            closingUploadDone = true;
            
        }
        
    }, 60000);
    
}

function restartAutocomplete(element, source, init) {
    
    if (init) {
        element.autocomplete({
            source: source
        });
    }
    
    else {
        element.autocomplete(
            'option',
            'source',
            source
        );
    }
    
}

function refreshReceiptEditModal () {
    
    $('.delete-serial-btn').remove();
    $('#serial-delete-btn, #serial-edit-btn').show();
    $('#serial-edit-modal .modal-dialog .modal-content .modal-body').html('<h2 style="text-align:center">هل تريد تعديل الرقم أم حذفه؟</h2>');
    
}

function handleQuickAction (action) {
    
    'use strict';
    
    var selectedRows = [],
        rowsData = {},
        companies = [];
    
    if (action === 'receive') {
        
        var sourceRows = $('#device-archive-table tbody tr'),
            body = $('.new-reception-receipt-table tbody'),
            receiptType = 'reception',
            companyInput = $('#new-reception-receipt-company'),
            liIndex = '1';
        
    } else {
        
        var sourceRows = $('#device-inventory-table tbody tr'),
            body = $('.new-delivery-receipt-table tbody'),
            receiptType = 'delivery',
            companyInput = $('#new-delivery-receipt-company'),
            liIndex = '2';
        
    }
    
    sourceRows.each(function () {
        
        var serialCol = $(this).children(':nth-child(3)');
        
        if (serialCol.hasClass('active')) {
            selectedRows.push(serialCol.parent());
        }
        
    });
    
    $.each(selectedRows, function (index, row) {
        
        var serial = row.children(':nth-child(3)').text(),
            company = row.children(':nth-child(4)').text(),
            type = row.children(':nth-child(5)').text();
        
        companies.push(company);
        
        if (rowsData.hasOwnProperty(type)) {
            rowsData[type].count += 1;
            rowsData[type].serials.push(serial);
        }
        
        else {
            rowsData[type] = {
                count: 1,
                serials: [serial]
            };
        }
        
    });
    
    if (!companies.reduce(function(a, b){ return (a === b) ? a : NaN; })) {
        
        iziToast.error({
            title: 'خطأ',
            message: 'لا يمكن اختيار أكثر من شركة واحدة',
            position: 'topRight',
            zindex: 99999
        });
        
        return;
        
    }
        
    body.children().children().each(function () {
        $(this).empty();
    });
    
    var currentRow = body.children(':first'),
        currentRowNumber = 1;
        
    setTimeout(function () {
        location.href = '../../receipts/new-' + receiptType + '-receipt/?data=' + JSON.stringify(rowsData) + '&company=' + companies[0];
    }, 500);
    
}

function reorderTableCounters(tableSelector) {
    
    $(tableSelector).each(function (index, element) {
        $(element).children(':nth-child(2)').text(index + 1);
    });
    
}
