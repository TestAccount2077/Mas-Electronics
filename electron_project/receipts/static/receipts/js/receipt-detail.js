var currentView = 'receipt-detail';

$(document).ready(function () {
    
    var table = $('.receipt-detail-table'),
        body = table.children('tbody'),
        rowCount = 0;

    // Calculating row count comprehensively
    $.each(receipt.row_data, function (type, rowData) {
        rowCount += Math.ceil(rowData.count / 3);
    });

    if (rowCount < 15) {
        rowCount = 15;
    }

    for (var i=0; i < rowCount; i++) {

        body.append('<tr data-row="' + (i + 1) + '">' +
                    '<td style="height: 37px" data-num="0"></td>' +
                    '<td data-num="1"></td>' +
                    '<td data-num="2" class="unlockable" data-lock-type="receipt-detail-type"></td>' +
                    '<td data-num="3" style="width:550px; text-align:right"></td>' +
                '</tr>');
    }

    //div = Math.ceil(rowData.count / 3),
    var currentCount = 1,
        currentRow = body.children('tr:first');

    $.each(receipt.row_data, function (type, rowData) {

        currentRow.children(':nth-child(2)').text(rowData.count);

        currentRow.children(':nth-child(3)')
            .text(type)
            .attr('data-type', type);

        currentCount = 1;

        $.each(rowData.serials, function(index, serial) {

            if (currentCount === 4) {
                currentCount = 1;
                currentRow = currentRow.next();
            }

            var element = $('<span class="receipt-detail-serial" data-serial="' + serial + '" contenteditable=false value="">' + serial + '</span>');

            currentRow.children(':last').append(element);

            currentCount += 1;

        });

        currentRow = currentRow.next();

    });

    reorderRows(table);
});

$(document).on('focusout', '.lockable', function (e) {
    
    var element = $(this);
    
    if (element.attr('data-lock-type') === 'receipt-detail-company') {
        
        var newCompanyName = element.text();
        
        if (!newCompanyName) {
            runFieldsRequiredNotification();
            element.focus();
            return;
        }
        
        $.ajax({
            url: 'receipts/ajax/update-receipt-company/',
            
            data: {
                pk: receiptDetailPk,
                type: receiptDetailType,
                newCompanyName: newCompanyName
            },
            
            success: function (data) {
                
                element
                    .attr('contenteditable', false)
                    .removeClass('lockable')
                    .addClass('unlockable');
                
                var receptionArchiveBody = $('.reception-archive-table tbody'),
                    deliveryArchiveBody = $('.delivery-archive-table tbody'),
                    receptionBody = $('#device-inventory-table tbody'),
                    maintenanceBody= $('#maintenance-table tbody'),
                    deliveryBody = $('#device-archive-table tbody');
                
                if (data.type === 'reception') {
                    
                    receptionBody.children('tr').children('td[data-company=' + receiptDetailOldCompany + ']').each(function () {
                        
                        if ($(this).parent().attr('data-receipt-pk') === data.pk.toString()) {
                            $(this).text(newCompanyName);
                            $(this).attr('data-company', newCompanyName);
                        }

                    });

                    maintenanceBody.children('tr').children('td[data-company=' + receiptDetailOldCompany + ']').each(function () {
                        
                        if ($(this).parent().attr('data-receipt-pk') === data.pk.toString()) {
                            $(this).text(newCompanyName);
                            $(this).attr('data-company', newCompanyName);
                        }

                    });
                    
                    receptionArchiveBody.children('tr').children('td[data-company=' + receiptDetailOldCompany + ']').each(function () {
                        
                        if ($(this).parent().attr('data-pk') === data.pk.toString()) {
                            
                            $(this).text(newCompanyName);
                            $(this).attr('data-company', newCompanyName);
                            
                        }
                        
                    });
                    
                } else {
                    
                    deliveryBody.children('tr').children('td[data-company=' + receiptDetailOldCompany + ']').each(function () {
                        if ($(this).parent().attr('data-receipt-pk') === data.pk.toString()) {
                            $(this).text(newCompanyName);
                            $(this).attr('data-company', newCompanyName);
                        }

                    });
                    
                    deliveryArchiveBody.children('tr').children('td[data-company=' + receiptDetailOldCompany + ']').each(function () {
                        
                        if ($(this).parent().attr('data-pk') === data.pk.toString()) {
                            $(this).text(newCompanyName);
                            $(this).attr('data-company', newCompanyName);
                        }

                    });
                }
            }
        });
    }
    
    else if (element.attr('data-lock-type') === 'receipt-detail-type') {
        
        var newType = element.text();
        
        if (!newType) {
            runFieldsRequiredNotification();
            element.focus();
            return;
        }
        
        $.ajax({
            url: 'receipts/ajax/update-device-type/',
            
            data: {
                receiptPk: receiptDetailPk,
                receiptType: receiptDetailType,
                oldType: receiptDetailOldType,
                newType: newType
            },
            
            success: function (data) {
                
                var pks = data.device_pks;
                
                element
                    .attr('contenteditable', false)
                    .removeClass('lockable')
                    .addClass('unlockable');
                
                var receptionBody = $('#device-inventory-table tbody'),
                    maintenanceBody = $('#maintenance-table tbody'),
                    deliveryBody = $('#device-archive-table tbody');

                maintenanceBody.children('tr').children('td[data-type="' + receiptDetailOldType + '"]').each(function () {
                    
                    if (pks.includes($(this).attr('data-pk'))) {
                        $(this).text(newType);
                        $(this).attr('data-type', newType);
                    }
                });
                
                receptionBody.children('tr').children('td[data-type="' + receiptDetailOldType + '"]').each(function () {

                    $(this).text(newType);
                    $(this).attr('data-type', newType);

                });

                deliveryBody.children('tr').children('td[data-type="' + receiptDetailOldType + '"]').each(function () {

                    $(this).text(newType);
                    $(this).attr('data-type', newType);

                });
                
            }
        });
    }
});

$(document).on('dblclick', '.receipt-detail-serial', function (e) {
    
    var input = $(this);
    
    var openModal = function () {
        $('#serial-edit-modal').modal('show');
        
        currentlyEditedSerial = input.text();
        currentlyEditedSerialInput = input;
    }
    
    executeAfterPassword(openModal);
    
});

$(document).on('click', '#serial-delete-btn', function (e) {
    
    var body = $('#serial-edit-modal .modal-dialog .modal-content .modal-body');
    
    $(this).hide();
    $('#serial-edit-btn').hide();
    
    body.children('h2').text('هل تريد حذف الجهاز من هذه الفاتورة فقط أم من جميع الفواتير؟');
    
    var btns = '<button type="button" class="btn btn-danger delete-serial-btn" id="serial-delete-here-only-btn" data-action="delete-here-only">هذه الفاتورة فقط</button><button type="button" class="btn btn-danger delete-serial-btn" id="serial-delete-everywhere-btn" data-action="delete-everywhere">من جميع الفواتير</button>';
    
    $('#serial-edit-modal .modal-dialog .modal-content .modal-footer').append(btns);
    
});

$(document).on('click', '.delete-serial-btn', function (e) {
    
    var action = $(this).attr('data-action'),
        data = {
            action: action
        };
    
    if (action === 'delete-here-only') {
        data.receiptPk = receiptDetailPk;
        data.receiptType = receiptDetailType;
        data.serial = currentlyEditedSerial;
    }
    
    else {
        data.serial = currentlyEditedSerial;
    }
    
    $.ajax({
        url: 'receipts/ajax/delete-device/',
        data: data,
        
        success: function (data) {
            
            currentlyEditedSerialInput.remove();
            
            if (action === 'delete-here-only') {
                var message = 'تم حذف الجهاز من هذه الفاتورة بنجاح'
            }
            
            else {
                var message = 'تم حذف الجهاز من جميع الفواتير بنجاح'
            }
            
            $('#serial-edit-modal').modal('hide');
                        
            refreshReceiptEditModal();
                        
            iziToast.success({
                title: 'Success',
                message: message,
                position: 'topRight',
                zindex: 99999
            });
            
        }
    });
});

$(document).on('click', '#serial-edit-btn', function (e) {
    
    var body = $('#serial-edit-modal .modal-dialog .modal-content .modal-body');
    
    body.html('<h2 style="text-align:center; margin-bottom: 20px">يرجى ادخال الرقم التسلسلى الجديد</h2><input id="receipt-detail-new-serial" class="form-control" style="margin-bottom: 20px">');
    
    $('#serial-delete-btn').hide();
    
    $(this)
        .attr('id', 'confirm-serial-edit-btn1')
        .text('متابعة');
    
});

$(document).on('click', '#confirm-serial-edit-btn1', function (e) {
    
    var btn = $(this);
    
    receiptDetailNewSerial = $('#receipt-detail-new-serial').val();
    
    if (!receiptDetailNewSerial) {
        
        runFieldsRequiredNotification();
        return;
        
    }
    
    $.ajax({
        url: 'receipts/ajax/get-device-receipts/',
        
        data: {
            oldSerial: currentlyEditedSerial,
            newSerial: receiptDetailNewSerial
        },
        
        success: function (data) {
            
            if (data.already_exists) {
                
                iziToast.error({
                    title: 'خطأ',
                    message: 'هذا الرقم موجود بالفعل ببيانات مختلفة',
                    position: 'topRight',
                    zindex: 99999
                });
                
                return;
                
            }
            
            var body = $('#serial-edit-modal .modal-dialog .modal-content .modal-body');
            
            body.empty();
            
            $.each(data.receipts, function (index, receipt) {
                
                var element = '<div class="receipt-detail-receipt-container" dir="rtl" data-pk="' + receipt.id + '" data-type="' + receipt.literal_type + '"><h2 class="receipt-detail-modal-label">' + receipt.type + ' رقم ' + receipt.id + ' بتاريخ ' + receipt.date + '</h2><img src="/static/images/check.png" class="receipt-detail-check"></div>';
                
                body.append(element);
                
            });            
            
            btn.attr('id', 'confirm-serial-edit-btn2');
            
        }
    });
    
});

$(document).on('click', '.receipt-detail-check', function (e) {
        
    $(this).toggleClass('check-selected');
    
});

$(document).on('click', '#confirm-serial-edit-btn2', function (e) {
    
    var btn = $(this),
        containers = $('.receipt-detail-check.check-selected'),
        data = [];
    
    containers.each(function () {
        
        var receiptData = {
            pk: $(this).parent().attr('data-pk'),
            type: $(this).parent().attr('data-type')
        }
        
        data.push(receiptData);
        
    });
    
    if (!data.length) {
        
        iziToast.error({
            title: 'خطأ',
            message: 'يرجى تحديد فاتورة واحدة على الأقل',
            position: 'topRight',
            zindex: 99999
        });
        
        return;
        
    }
    
    $.ajax({
        url: 'receipts/ajax/edit-serial/',
        
        data: {
            receipts: JSON.stringify(data),
            oldSerial: currentlyEditedSerial,
            newSerial: receiptDetailNewSerial
        },
        
        success: function (data) {
            
            currentlyEditedSerialInput.text(receiptDetailNewSerial);
            
            btn.attr('id', 'serial-edit-btn');
            
            $('#serial-edit-modal').modal('hide');
            
            refreshReceiptEditModal();
            
            iziToast.success({
                title: 'Success',
                message: 'تم تعديل الرقم التسلسلى بنجاح',
                position: 'topRight',
                zindex: 99999
            });
            
        }
    });
});

$(document).on('dblclick', '.unlockable', function (e) {
    
    var element = $(this);
    
    var unlockCell = function () {
        
        element
            .attr('contenteditable', true)
            .removeClass('unlockable')
            .addClass('lockable')
            .focus();
        
        if (element.attr('data-lock-type') === 'receipt-detail-company') {
            receiptDetailOldCompany = element.text();
        }
        
        else if (element.attr('data-lock-type') === 'receipt-detail-type') {
            receiptDetailOldType = element.text();
        }
        
    }
    
    executeAfterPassword(unlockCell);
    
});

$("#serial-edit-modal").on('hidden.bs.modal', function () {
    
    refreshReceiptEditModal();
    
});