$(document).ready(function () {
    
    var today = new Date(),
        today = today.getDate() + '/' + (today.getMonth() + 1) + '/' + today.getFullYear();
    
    $('#new-' + receiptType + '-receipt-company').val(company);
    
    $('#new-reception-receipt-date, #new-delivery-receipt-date').val(today);
    
    if (receiptType === 'reception') {
        
        var body = $('.new-reception-receipt-table tbody'),
            companyInput = $('#new-reception-receipt-company');
        
    } else {
        
        var body = $('.new-delivery-receipt-table tbody'),
            companyInput = $('#new-delivery-receipt-company');
        
    }
    
    var currentRow = body.children(':first'),
        currentRowNumber = 1;
    
    if (rowData) {
        $.each(rowData, function (type, data) {
            
            var firstRow = currentRow;
            currentRow.children(':nth-child(2)').text(data.count);
            currentRow.children(':nth-child(3)').text(type);

            var currentInputCount = 0;

            $.each(data.serials, function (index, serial) {

                currentInputCount++;

                var input = '<input type="text" class="new-' + receiptType + '-receipt-input" data-associated-with="' + firstRow.data('row') + '" value="' + serial + '">';

                if (currentInputCount === 4) {
                    currentInputCount = 1;
                    currentRow = currentRow.next();
                    currentRowNumber++;
                }

                currentRow.children(':last').append(input);

            });

            currentRow = currentRow.next();
            currentRowNumber++;

        });
    }
    
});

$(document).on('click', '.receipt-save', function (e) {
    
    var btn = $(this),
        prefix = btn.attr('data-prefix'),
        table = $('.' + prefix + '-table'),
        body = table.children('tbody'),
        rowCount = body.children().length,
        
        companyInput = $('#' + prefix + '-company'),
        dateInput = $('#' + prefix + '-date'),
        innerReprInput = $('#' + prefix + '-inner-repr'),
        outerReprInput = $('#' + prefix + '-outer-repr'),
        
        emptyInputs = 0,
        emptyRows = 0,
        data = [],
        idLabel,
        typeLabel,
        idHolder,
        ajaxUrl;
    
    if (!companyInput.val() || !dateInput.val() || !innerReprInput.val() || !outerReprInput.val()) {
        
        iziToast.error({
            title: 'خطأ',
            message: 'الرجاء ملأ الخانات الخالية',
            position: 'topRight',
            zindex: 99999
        });
        
        if (!companyInput.val()) {
            companyInput.addClass('invalid-input');
        }
        
        if (!dateInput.val()) {
            dateInput.addClass('invalid-input');
        }
        
        if (!innerReprInput.val()) {
            innerReprInput.addClass('invalid-input');
        }
        
        if (!outerReprInput.val()) {
            outerReprInput.addClass('invalid-input');
        }
        
        return;
        
    }
    
    btn
        .attr('disabled', true)
        .text('جار الحفظ...');
    
    for (var i=1; i <= rowCount; i++) {
        
        var row = body.children('tr[data-row=' + i + ']'),
            rowNumber = row.attr('data-row'),
            qty = row.children(':nth-child(2)').text(),
            type = row.children(':nth-child(3)').text();
        
        if (qty) {
            if (type) {
                
                var rowData = {
                    qty: qty,
                    type: type
                },
                    serialNumbers = [];
                
                $('.' + prefix + '-input[data-associated-with=' + rowNumber + ']').each(function () {
                    
                    var value = $(this).val();
                    
                    if (!value) {
                        emptyInputs += 1;
                        
                        $(this).addClass('invalid-input');
                        
                    } else {
                        serialNumbers.push(value);
                    }
                    
                });
                
                rowData.serialNumbers = serialNumbers;
                
                data.push(rowData);
                                
            } else {
                
                emptyInputs += 1;
                row.children(':nth-child(3)').addClass('invalid-input');
                
            }
            
        } else if (type) {
            
            emptyInputs += 1;
            row.children(':nth-child(2)').addClass('invalid-input');
            
        } else {
            emptyRows += 1;
        }
    }
        
    if (emptyRows === rowCount) {
        
        iziToast.error({
            title: 'خطأ',
            message: 'يجب اضافة عنصر واحد على الأقل',
            position: 'topRight',
            zindex: 99999
        });
        
        btn
            .attr('disabled', false)
            .text('حفظ وطباعة');
        
    } else if (emptyInputs) {
        
        iziToast.error({
            title: 'خطأ',
            message: 'الرجاء ملأ الخانات الخالية',
            position: 'topRight',
            zindex: 99999
        });
        
        btn
            .attr('disabled', false)
            .text('حفظ وطباعة');
        
    } else {
        
        $('#inner-repr-label').text(innerReprInput.val());
        $('#outer-repr-label').text(outerReprInput.val());
        
        if (prefix === 'new-reception-receipt') {
            ajaxUrl = 'receipts/ajax/create-reception-receipt/';
            idLabel = $('#new-reception-id-label');
            idHolder = currentReceptionId;
            typeLabel = 'اذن استلام';
        }

        else {
            ajaxUrl = 'receipts/ajax/create-delivery-receipt/';
            idLabel = $('#new-delivery-id-label');
            idHolder = currentDeliveryId;
            typeLabel = 'اذن تسليم';
        }
        
        var company = companyInput.val(),
            date = dateInput.val(),
            innerRepresentative = innerReprInput.val(),
            outerRepresentative = outerReprInput.val();
        
        $.ajax({
            url: ajaxUrl,
            type: 'POST',
            
            data: {
                data: JSON.stringify(data),
                company: company,
                date: date,
                innerRepresentative: innerRepresentative,
                outerRepresentative: outerRepresentative
            },
            
            success: function (data) {
                
                printReceipt(table, $('#' + prefix + '-company, #' + prefix + '-inner-repr, #' + prefix + '-outer-repr'), idHolder, typeLabel);
                
                if (prefix === 'new-reception-receipt') {
                    //updateTablesPostReceiptCreation(data.devices, 'reception');
                    
                    $.each(data.devices, function (index, device) {
                        /*if (!newDeliveryReceiptSerials.includes(device.serial_number)) {
                            newDeliveryReceiptSerials.push(device.serial_number);
                        }*/
                        
                        if (newReceptionReceiptSerials.includes(device.serial_number)) {
                            newReceptionReceiptSerials.remove(device.serial_number);
                        }
                        
                    });
                }
                
                else {
                    //updateTablesPostReceiptCreation(data.devices, 'delivery');
                    
                    $.each(data.devices, function (index, device) {
                        /*if (!newReceptionReceiptSerials.includes(device.serial_number)) {
                            newReceptionReceiptSerials.push(device.serial_number);
                        }*/
                        
                        if (newDeliveryReceiptSerials.includes(device.serial_number)) {
                            newDeliveryReceiptSerials.remove(device.serial_number);
                        }
                        
                    });
                }
                
                idLabel.text(data.receipt.id + 1);
                
                restartAutocomplete($('#new-reception-receipt-company'), data.reception_companies);
                restartAutocomplete($('#new-delivery-receipt-company'), data.delivery_companies);
                
                restartAutocomplete($('.new-reception-cell[data-num=2]'), data.reception_types, true);
                restartAutocomplete($('.new-delivery-cell[data-num=2]'), data.delivery_types, true);
                
                var receipt = data.receipt;
                
                if (prefix === 'new-reception-receipt') {
                    var body = $('.reception-archive-table tbody'),
                        label = 'reception';
                    
                    currentReceptionId = receipt.id + 1;
                    
                } else {
                    
                    var body = $('.delivery-archive-table tbody'),
                        label = 'delivery';
                    
                    currentDeliveryId = receipt.id + 1;
                    
                }
                
                var row = '<tr data-pk="' + receipt.id + '">' +
                    '<td>' + receipt.id + '</td>' +
                    '<td data-company="' + receipt.company_name + '">' + receipt.company_name + '</td>' +
                    '<td>' + receipt.date + '</td>' +
                    '<td>' + receipt.outer_representative + '</td>' +
                    '<td>' + receipt.inner_representative + '</td>' +
                    '<td><a href="#receipt-detail" class="receipt-link" data-type="' + label + '" data-pk="' + receipt.id + '">ذهاب</a></td></tr>';
                
                body.append(row);
                
                btn
                    .attr('disabled', false)
                    .text('حفظ وطباعة');
                
                iziToast.success({
                    title: 'Success',
                    message: 'تم حفظ الفاتورة بنجاح',
                    position: 'topRight',
                    zindex: 99999
                });
            },
            
            error: function (error) {
                
                btn
                    .attr('disabled', false)
                    .text('حفظ وطباعة');
                
                generateAlerts(error);
            }
        });
    }
});

$(document).on('click', '.receipt-table tbody tr td.editable', function (e) {
    
    $(this).attr('contenteditable', true).focus();
    currentValue = $(this).text();
    
});

$(document).on('focusout', '.receipt-table tbody tr td', function (e) {
                
    var cell = $(this),
        cellRow = cell.parent(),
        cellNum = Number.parseInt(cell.attr('data-num')),
        body = cellRow.parent(),
        value = Number.parseInt(cell.text());

    if (cellNum === 1) {
        if (cell.text() && !Number.isInteger(value)) {

            iziToast.error({
                title: 'خطأ',
                message: 'هذه الخانة يجب أن تكون رقمية',
                position: 'topRight',
                zindex: 99999
            });

            cell.text('');

        } else if (!cell.text()) {

            // Checking if edited
            // Checking if more than remaining rows
            renderCells(cellRow, body);
            reorderRows(body.parent());

        } else {

            // Checking for collissions
            var collisionsExist = checkForCollisions(cellRow, body, body.parent());

            if (collisionsExist) {

                iziToast.error({
                    title: 'خطأ',
                    message: 'لا توجد مساحة كافية',
                    position: 'topRight',
                    zindex: 99999
                });

                cell.text('');
                reorderRows(body.parent());

            }

            // Checking if edited
            // Checking if more than remaining rows
            renderCells(cellRow, body);
            reorderRows(body.parent());

        }
    }
    cell.attr('contenteditable', false);
});

function checkForCollisions (row, body, table) {
    
    var rowNumber = Number.parseInt(row.attr('data-row')),
        value = Number.parseInt(row.children(':nth-child(2)').text()),
        rowCount = Math.ceil(value / 3),
        collisionsExist = false,
        rowCount;
    
    for (var i = rowNumber + 1; i < rowNumber + rowCount; i++) {
        
        var qty = body.children('tr[data-row=' + i + ']').children(':nth-child(2)').text(),
            type = body.children('tr[data-row=' + i + ']').children(':nth-child(3)').text()
        
        if (qty || type) {
            collisionsExist = true;
        }
    }
    
    if (table.attr('data-table-name') === 'new-reception-receipt-table') {
        tableRowCount = receptionReceiptRowCount;
    
    } else {
        tableRowCount = deliveryReceiptRowCount;
    }
    
    if (rowNumber + rowCount > tableRowCount) {
        
        for (i=tableRowCount + 1; i <= tableRowCount + 15; i++) {
            
            var row = '<tr data-row="' + i + '">' +
                '<td style="height: 37px" data-num="0"></td>' +
                '<td class="editable" data-num="1"></td>' +
                '<td class="editable" data-num="2"></td>' +
                '<td data-num="3" style="width:550px; text-align:right"></td>' +
            '</tr>';
            
            body.append(row);
        }
        
        if (table.attr('data-table-name') === 'new-reception-receipt-table') {
            receptionReceiptRowCount += 15

        } else {
            deliveryReceiptRowCount += 15
        }
        
        
    }
    
    return collisionsExist;
}

function renderCells(row, body) {
    
    body.children().children('td[data-num=0]').empty();
    
    var rowNumber = Number.parseInt(row.attr('data-row')),
        value = Number.parseInt(row.children(':nth-child(2)').text()),
        rowCount = Math.ceil(value / 3),
        serials,
        inputClass;
    
    if (body.parent().attr('data-table-name') === 'new-reception-receipt-table') {
        serials = newReceptionReceiptSerials;
        inputClass = 'new-reception-receipt-input';
    }
    
    else {
        serials = newDeliveryReceiptSerials;
        inputClass = 'new-delivery-receipt-input';
    }
    
    var currentRow = row,
        currentCount = 0;
    
    $('input[data-associated-with=' + rowNumber + ']').each(function (e) {
        
        $(this).parent().prev().addClass('editable');
        $(this).parent().prev().prev().addClass('editable');
        
        $(this).remove();
        
    });
    
    for (var i=0; i < value; i++) {
        
        // Locking cells within the perimeter
        if (currentRow.attr('data-row') !== rowNumber.toString()) {
            currentRow.children(':nth-child(2), :nth-child(3)')
                .removeClass('editable')
                .attr('contenteditable', false);
        }
        
        currentCount += 1;
        
        if (currentCount === 4) {
            currentCount = 1;
            currentRow = currentRow.next();
        }
        
        var element = $('<input type="text" class="' + inputClass + '" data-associated-with="' + rowNumber + '">');
        
        element.autocomplete({
            source: serials
        });
        
        currentRow.children(':last').append(element);
        
    }
}