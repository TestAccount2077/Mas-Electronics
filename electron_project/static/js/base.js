var currentValue,
    password,
    pendingToUnlockElement,
    pendingCallback,
    currentView;

var filterableViews = [
    'device-inventory', 'maintenance', 'sparepart-inventory',
    'device-archive', 'reception-receipt-archive', 'delivery-receipt-archive',
    'daily-expenses', 'expense-archive', 'expense-detail'
];

var viewsAndFilterModals = {
    
    'device-inventory': {
        
        table: '#device-inventory-table',
        
        head: 'مخزن الأجهزة',
        
        body: '<input type="text" class="form-control" placeholder="رقم الجهاز" style="margin-bottom:20px" id="filter-serial"><input type="text" class="form-control" placeholder="اسم الشركة" style="margin-bottom:20px" id="filter-company"><input type="text" class="form-control" placeholder="نوع الجهاز" id="filter-type" style="margin-bottom:20px"><input type="text" class="form-control" placeholder="من" style="margin-bottom:20px" id="filter-from"><input type="text" class="form-control" placeholder="الى" style="margin-bottom:20px" id="filter-to"><div style="text-align: right;font-size: 20px;margin-right: 2%;"><input type="checkbox" style="margin-right:10px" id="filter-returned">مرتجع</div>'
    },
    
    'maintenance': {
        
        table: '#maintenance-table',
        
        head: 'جدول الصيانة',
        
        body: '<input type="text" class="form-control" placeholder="رقم الجهاز" style="margin-bottom:20px" id="filter-serial"><input type="text" class="form-control" placeholder="اسم الشركة" style="margin-bottom:20px" id="filter-company"><input type="text" class="form-control" placeholder="نوع الجهاز" id="filter-type" style="margin-bottom:20px"><input type="text" class="form-control" placeholder="من" style="margin-bottom:20px" id="filter-from"><input type="text" class="form-control" placeholder="الى" style="margin-bottom:20px" id="filter-to"><input type="text" class="form-control" placeholder="مسؤول الصيانة" style="margin-bottom:20px" id="filter-assignee"><input type="text" class="form-control" placeholder="مظاهر العيب" style="margin-bottom:20px" id="filter-flaws"><input type="text" class="form-control" placeholder="ما تم تغييره" style="margin-bottom:20px" id="filter-sparepart"><input type="text" class="form-control" placeholder="العدد" style="margin-bottom:20px" id="filter-count"><input type="text" class="form-control" placeholder="ملاحظات" style="margin-bottom:20px" id="filter-notes">'
        
    },
    
    'sparepart-inventory': {
        
        table: '#sparepart-inventory-table',
        
        head: 'مخزن قطع الغيار',
        
        body: '<input type="text" class="form-control" placeholder="النوع" style="margin-bottom:20px" id="filter-name"><input type="text" class="form-control" placeholder="الكمية" style="margin-bottom:20px" id="filter-count"><input type="text" class="form-control" placeholder="الحد الأدنى" style="margin-bottom:20px" id="filter-minimum"><div style="text-align: right;font-size: 20px;margin-right: 2%;"><input type="checkbox" style="margin-right:10px" id="filter-lt-minimum">أقل من الحد الأدنى</div>'
        
    },
    
    'device-archive': {
        
        table: '#device-archive-table',
        
        head: 'أرشيف الأجهزة',
        
        body: '<input type="text" class="form-control" placeholder="رقم الجهاز" style="margin-bottom:20px" id="filter-serial"><input type="text" class="form-control" placeholder="اسم الشركة" style="margin-bottom:20px" id="filter-company"><input type="text" class="form-control" placeholder="نوع الجهاز" id="filter-type" style="margin-bottom:20px"><input type="text" class="form-control" placeholder="من" style="margin-bottom:20px" id="filter-from"><input type="text" class="form-control" placeholder="الى" style="margin-bottom:20px" id="filter-to"><div style="text-align: right;font-size: 20px;margin-right: 2%;"><input type="checkbox" style="margin-right:10px" id="filter-in-inventory">فى المخرن</div>'
        
    },
    
    'reception-receipt-archive': {
        
        table: '.reception-archive-table',
        
        head: 'أرشيف فواتير الاستلام',
        
        body: '<input type="text" class="form-control" placeholder="الرقم" style="margin-bottom:20px" id="filter-id"><input type="text" class="form-control" placeholder="اسم الشركة" style="margin-bottom:20px" id="filter-company"><input type="text" class="form-control" placeholder="من" style="margin-bottom:20px" id="filter-from"><input type="text" class="form-control" placeholder="الى" style="margin-bottom:20px" id="filter-to"><input type="text" class="form-control" placeholder="اسم المندوب" id="filter-outer-repr" style="margin-bottom:20px"><input type="text" class="form-control" placeholder="مندوب مركز الصيانة" id="filter-inner-repr" style="margin-bottom:20px">'
        
    },
    
    'delivery-receipt-archive': {
        
        table: '.delivery-archive-table',
        
        head: 'أرشيف فواتير التسليم',
        
        body: '<input type="text" class="form-control" placeholder="الرقم" style="margin-bottom:20px" id="filter-id"><input type="text" class="form-control" placeholder="اسم الشركة" style="margin-bottom:20px" id="filter-company"><input type="text" class="form-control" placeholder="من" style="margin-bottom:20px" id="filter-from"><input type="text" class="form-control" placeholder="الى" style="margin-bottom:20px" id="filter-to"><input type="text" class="form-control" placeholder="اسم المندوب" id="filter-outer-repr" style="margin-bottom:20px"><input type="text" class="form-control" placeholder="مندوب مركز الصيانة" id="filter-inner-repr" style="margin-bottom:20px">'
        
    },
    
    'receipt-detail': {
        
        table: '.receipt-detail-table'
        
    },
    
    'daily-expenses': {
        
        table: '#daily-expenses-table',
        
        head: 'مصاريف اليوم',
        
        body: '<input type="text" class="form-control filter-expense" placeholder="سحب" style="margin-bottom:20px"><input type="text" class="form-control filter-revenue" placeholder="اضافة" style="margin-bottom:20px"><input type="text" class="form-control" placeholder="البيان" style="margin-bottom:20px" id="filter-description"><input type="text" class="form-control" placeholder="من" style="margin-bottom:20px" id="filter-from"><input type="text" class="form-control" placeholder="الى" style="margin-bottom:20px" id="filter-to"><input type="text" class="form-control" placeholder="الاجمالى" style="margin-bottom:20px" id="filter-total">'
        
    },
    
    'expense-archive-list': {
        
        table: '#expense-archive-table',
        
        head: 'أرشيف المصاريف'
        
    },
    
    'filter-view': {
        
        table: '#filter-table'
        
    },
    
    'expense-archive-detail': {
        
        table: '#expense-archive-detail-table' // #expense-archive-closing-table
        
    }
};

var tabsAndSubmenus = {
    
    'devices-tab': '#devices-submenu',
    'receipts-tab': '#receipts-submenu',
    'archive-tab': '#archive-submenu',
    'expenses-tab': '#expenses-submenu',
    'attendance-tab': '#attendance-submenu',
    'report-tab': '#report-submenu'
    
};

// CENTERED MODALS
// phase one - store every dialog's height
$('.modal').each(function () {
    var t = $(this),
        d = t.find('.modal-dialog'),
        fadeClass = (t.is('.fade') ? 'fade' : '');
    // render dialog
    t.removeClass('fade')
        .addClass('invisible')
        .css('display', 'block');
    // read and store dialog height
    d.data('height', d.height());
    // hide dialog again
    t.css('display', '')
        .removeClass('invisible')
        .addClass(fadeClass);
});
// phase two - set margin-top on every dialog show
$('.modal').on('show.bs.modal', function () {
    var t = $(this),
        d = t.find('.modal-dialog'),
        dh = d.data('height'),
        w = $(window).width(),
        h = $(window).height();
    // if it is desktop & dialog is lower than viewport
    // (set your own values)
    if (w > 380 && (dh + 60) < h) {
        d.css('margin-top', Math.round(0.50 * (h - dh) / 2));
    } else {
        d.css('margin-top', '');
    }
});

function generateAlerts(error) {
    
    'use strict';
    
    var data,
        message = '';
    
    if (error.status === 400) {
        
        data = error.responseJSON;
        
        $.each(data, function (e, errorMessage) {
            message += '&bull; ' + errorMessage + '<br>';
        });
        
        iziToast.error({
            title: 'خطأ',
            message: message,
            position: 'topRight',
            zindex: 99999
        });
        
    } else if (error.status === 500) {
        
        iziToast.error({
            title: 'خطأ',
            message: 'حدث خطأ ما. يرجى اخطار المبرمج',
            position: 'topRight',
            zindex: 99999
        });
    }
}

function getCookie(name) {
    
    'use strict';
    
    var cookieValue = null,
        i,
        cookies,
        cookie;
    if (document.cookie && document.cookie !== '') {
        cookies = document.cookie.split(';');
        for (i = 0; i < cookies.length; i += 1) {
            cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

var csrftoken = getCookie('csrftoken');

function csrfSafeMethod(method) {
    
    'use strict';
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

$.ajaxSetup({
    beforeSend: function (xhr, settings) {
        
        'use strict';
        
        if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
    }
});

function isNumeric(string) {
    
    return !isNaN(string) || (!isNaN(string) && string.toString().indexOf('.') != -1);
    
}

function executeAfterPassword(callback) {
    
    if (password) {
        
        iziToast.info({
        
            timeout: 20000,
            overlay: true,
            toastOnce: true,
            id: 'inputs',
            zindex: 999,
            position: 'center',
            drag: false,
            rtl: false,
        
            inputs: [

                ['<input type="password">', 'keyup', function (instance, toast, input, e) {

                    var key = e.which,
                        pass = $(input).val();

                    if (key === 13) {

                        if (pass) {
                            if (pass === password) {

                                instance.hide({transitionOut: 'fadeOutUp'}, toast);

                                callback();

                            } else {

                                iziToast.error({
                                    title: 'خطأ',
                                    message: 'كلمة السر خاطئة',
                                    position: 'topRight',
                                    zindex: 99999
                                });

                            }
                        } else {

                            iziToast.error({
                                title: 'خطأ',
                                message: 'يرجى ادخال كلمة السر',
                                position: 'topRight',
                                zindex: 99999
                            });

                        }
                    }

                }, true],
            ]
        
        });
        
    } else {
        pendingCallback = callback;
        
        $('#new-password-modal').modal('show');
    }
    
}

function runFieldsRequiredNotification() {
    
    iziToast.error({
        title: 'خطأ',
        message: 'يرجى ملأ الحقول الخالية',
        position: 'topRight',
        zindex: 99999
    });
    
}

// implementation of an Array's remove method
Array.prototype.remove = function () {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};

$(document).on('click', '.sortable', function (e) {
    
    var btn = $(this),
        criteria = btn.attr('data-criteria'),
        table = btn.parent().parent().parent(),
        id = table.attr('id'),
        deviceTables = ['device-inventory-table', 'maintenance-table', 'device-archive-table'];
    
    $('.sort-carat').hide();
    
    btn.children().show();
    
    $.ajax({
        url: 'ajax/sort-table/',
        
        data: {
            tableId: table.attr('id'),
            criteria: criteria
        },
        
        success: function (data) {
            
            var items = data.items,
                body = table.children('tbody');
            
            if (deviceTables.includes(id)) {
                
                var counter = 1;
                
                $.each(items, function (index, item) {
                    
                    var row = body.children('tr[data-serial="' + item.serial_number + '"]');
                    
                    if (row.is(':visible')) {
                        row.children(':nth-child(2)').text(counter);
                        counter++;
                    }
                    
                    body.append(row);
                    
                });
                
                if (id === 'maintenance-table') {
                    var lastRow = body.children(':first');
                    
                    body.append(lastRow);
                }
                
            }
            
            else if (id === 'sparepart-inventory-table') {
                
                var counter = 1;
                
                $.each(items, function (index, item) {
                    
                    var row = body.children('tr[name="' + item.name + '"]');
                    
                    if (row.is(':visible')) {
                        row.children(':nth-child(2)').text(counter);
                        counter++;
                    }
                    
                    body.append(row);
                    
                });
                
                var lastRow = body.children(':first');
                                
                body.append(lastRow);
                
            }
        }
    });
});

$(document).on('click', '#print', function (e) {
    
    var viewData = viewsAndFilterModals[currentView],
        table = $(viewData.table),
        body = table.children('tbody'),
        printedTable = $('#print-table');
    
    printedTable.empty();
    
    printedTable.append(table.children('thead').clone());
    printedTable.append(table.children('tbody').clone());
    
    if (viewData.table === '#expense-archive-detail-table') {
        $('#print-page-title').show().text('مصاريف يوم ' + expenseDetailDate);
    }
    
    else if (viewData.table === '.receipt-detail-table') {
        
        var label = $('#receipt-detail-type-label').text() + ' رقم ' + $('#receipt-detail-id-label').text();
        
        $('#print-page-title').show().text(label);
    }
    
    else {
        $('#print-page-title').show().text(viewData.head);
    }
    
    var body = table.children('tbody'),
        rowCount = body.children(':visible').length,
        tableCount = Math.ceil(rowCount / 20),
        pageNumberElement = $('#print-receipt-page-num');
    
    var printedBody = printedTable.children('tbody');
    
    var data = {
        typeLabel: $('#receipt-detail-type-label').text(),
        newId: $('#receipt-detail-id-label').text()
    }
    
    if (currentView === 'receipt-detail') {
        prepareTableForPrint(tableCount, printedBody, pageNumberElement, 1, 1, body, 'receipt', data);
        
    } else {
        prepareTableForPrint(tableCount, printedBody, pageNumberElement, 1, 1, body);
    }
    
});

$(document).on('click', '#filter-btn', function (e) {
    
    if (!filterableViews.includes(currentView)) {
        
        iziToast.error({
            title: 'خطأ',
            message: 'لا يمكن فلترة هذه الصفحة',
            position: 'topRight',
            zindex: 99999
        });
        
        return;
    }
    
    var viewData = viewsAndFilterModals[currentView];
        
    $('#filter-header').text('فلترة ' + viewData.head);
    $('#filter-body').html(viewData.body);
    
    setTimeout(prepareFilterModal, 1000);
    
    $('#filter-modal').modal('show');
    
});

$(document).on('click', '#confirm-filter-btn', function (e) {
    
    if (currentView === 'device-inventory') {
        
        var data = {
            serial: $('#filter-serial').val(),
            company: $('#filter-company').val(),
            type: $('#filter-type').val(),
            from: $('#filter-from').val(),
            to: $('#filter-to').val(),
            returned: $('#filter-returned').is(':checked')
        }
        
        $.ajax({
            url: 'devices/ajax/filter-device-inventory/',
            type: 'POST',
            
            data: data,
            
            success: function (data) {
                                                
                var table = $('#device-inventory-table'),
                    body = table.children('tbody');
                
                body.children().hide();
                
                $.each(data.devices, function (index, device) {
                                        
                    var row = $('#device-inventory-table tbody tr[data-serial="' + device.serial_number + '"]');
                    
                    row.remove();
                    
                    body.append(row);
                    
                    row
                        .show()
                        .children(':nth-child(2)').text(index + 1);
                });
                
                $('#filter-modal').modal('hide');
                
            },
            
            error: function (error) {
                
            }
        });   
    }
    
    else if (currentView === 'maintenance') {
        
        var data = {
            serial: $('#filter-serial').val(),
            company: $('#filter-company').val(),
            type: $('#filter-type').val(),
            from: $('#filter-from').val(),
            to: $('#filter-to').val(),
            
            assignee: $('#filter-assignee').val(),
            flaws: $('#filter-flaws').val(),
            sparepart: $('#filter-sparepart').val(),
            count: $('#filter-count').val(),
            notes: $('#filter-notes').val()
        }
        
        if (!isNumeric(data.count)) {
            
            iziToast.error({
                title: 'خطأ',
                message: 'العدد يجب أن يكون رقميا',
                position: 'topRight',
                zindex: 99999
            });
            
            return;
            
        }
        
        $.ajax({
            url: 'devices/ajax/filter-maintenance/',
            type: 'POST',
            
            data: data,
            
            success: function (data) {
                                
                var table = $('#maintenance-table'),
                    body = table.children('tbody');
                
                body.children(':not(:last)').hide();
                
                $.each(data.devices, function (index, device) {
                    $('#maintenance-table tbody tr[data-serial="' + device.serial_number + '"]').show();
                });
                
                $('#filter-modal').modal('hide');
                
            },
            
            error: function (error) {
                
            }
        });
    }
    
    else if (currentView === 'sparepart-inventory') {
        
        var data = {
            
            name: $('#filter-name').val(),
            count: $('#filter-count').val(),
            minimum: $('#filter-minimum').val(),
            lessThanMinimum: $('#filter-lt-minimum').is(':checked')
            
        }
        
        $.ajax({
            url: 'devices/ajax/filter-sparepart-inventory/',
            type: 'POST',
            
            data: data,
            
            success: function (data) {
                                
                var table = $('#sparepart-inventory-table'),
                    body = table.children('tbody');
                
                body.children(':not(:last)').hide();
                
                $.each(data.spareparts, function (index, device) {
                    $('#sparepart-inventory-table tbody tr[data-pk="' + device.pk + '"]').show();
                });
                
                $('#filter-modal').modal('hide');
            },
            
            error: generateAlerts
        });
    }
    
    else if (currentView === 'device-archive') {
        
        var data = {
            serial: $('#filter-serial').val(),
            company: $('#filter-company').val(),
            type: $('#filter-type').val(),
            from: $('#filter-from').val(),
            to: $('#filter-to').val(),
            inInventory: $('#filter-in-inventory').is(':checked')
        }
        
        $.ajax({
            url: 'devices/ajax/filter-device-archive/',
            type: 'POST',
            
            data: data,
            
            success: function (data) {
                                                
                var table = $('#device-archive-table'),
                    head = table.children('thead'),
                    body = table.children('tbody');
                
                body.children().hide();
                
                $.each(data.devices, function (index, device) {
                    
                    var row = $('#device-archive-table tbody tr[data-serial="' + device.serial_number + '"]');
                    
                    row.remove();
                    
                    body.append(row);
                    
                    row
                        .show()
                        .children(':nth-child(2)').text(index + 1);
                                    
                });
                
                $('#filter-modal').modal('hide');
                
            },
            
            error: generateAlerts
        });   
    }
    
    else if (currentView === 'reception-receipt-archive' || currentView === 'delivery-receipt-archive') {
        
        var data = {
            id: $('#filter-id').val(),
            company: $('#filter-company').val(),
            from: $('#filter-from').val(),
            to: $('#filter-to').val(),
            innerRepr: $('#filter-inner-repr').val(),
            outerRepr: $('#filter-outer-repr').val()
        };
        
        if (currentView === 'reception-receipt-archive') {
            var type = data.type = 'reception';
        } else {
            var type = data.type = 'delivery';
        }
        
        $.ajax({
            url: '/receipts/ajax/filter-receipt-archive/',
            type: 'POST',
            
            data: data,
            
            success: function (data) {
                
                if (type === 'reception') {
                    
                    var table = $('.reception-archive-table'),
                        body = table.children('tbody');
                    
                }
                
                else {
                    
                    var table = $('.delivery-archive-table'),
                        body = table.children('tbody');
                    
                }
                
                body.children().hide();
                                
                $.each(data.receipts, function (index, receipt) {
                    body.children('tr[data-pk="' + receipt.id + '"]').show();
                });
                
                $('#filter-modal').modal('hide');
                
            },
            
            error: generateAlerts
        });   
    }
    
    else if (currentView === 'daily-expenses') {
        
        var data = {
            
            balanceChange: '',
            description: $('#filter-description').val(),
            from: $('#filter-from').val(),
            to: $('#filter-to').val(),
            total: $('#filter-total').val()
            
        }
        
        if ($('.filter-expense').val()) {
            data.balanceChange = '-' + $('.filter-expense').val();
        
        } else if ($('.filter-revenue').val()) {
            data.balanceChange = $('.filter-revenue').val();
        }
        
        if (data.balanceChange && !isNumeric(data.balanceChange)) {
            
            iziToast.error({
                title: 'خطأ',
                message: 'حقول السحب والاضافة يجب أن تكون رقمية',
                position: 'topRight',
                zindex: 99999
            });
            
            return;
            
        }
        
        if (data.total && !isNumeric(data.total)) {
            
            iziToast.error({
                title: 'خطأ',
                message: 'الاجمالى يجب ان يكون رقميا',
                position: 'topRight',
                zindex: 99999
            });
            
            return;
            
        }
        
        $.ajax({
            url: 'expenses/ajax/filter-expenses/',
            type: 'POST',
            
            data: data,
            
            success: function (data) {
                
                var table = $('#daily-expenses-table'),
                    head = table.children('thead'),
                    body = table.children('tbody');
                
                body.children(':not(:last)').hide();
                
                $.each(data.expenses, function (index, expense) {
                    $('#daily-expenses-table tbody tr[data-pk="' + expense.id + '"]').show();
                });
                
                $('#filter-modal').modal('hide');
            },
            
            error: generateAlerts
        });
        
    }
});

$(document).on('keypress', function (e) {
    
    var key = e.which;
    
    if (key === 6) {
        $('#filter-btn').click();
    }
    
    else if (key === 16) {
        $('#print').click();
    }
    
});

$(document).on('click', '#confirm-total-filter-btn', function (e) {
    
    var data = {
        serial: $('#total-filter-serial').val(),
        company: $('#total-filter-company').val(),
        type: $('#total-filter-type').val(),
        from: $('#total-filter-from').val(),
        to: $('#total-filter-to').val()
    }
    
    $.ajax({
        url: 'devices/ajax/total-filter/',
        type: 'POST',
        data: data,
        
        success: function (data) {
            
            var table = $('#total-filter-table'),
                body = table.children('tbody');
            
            body.empty();
            
            $.each(data.devices, function (index, device) {
                
                var row = '<tr><td></td><td>' + (index + 1) + '</td><td>' + device.serial_number + '</td><td>' + device.company_name + '</td><td>' + device.device_type + '</td><td>' + device.location + '</td><td>' + device.date + '</td><td><a href="../' + device.serial_number + '/" class="device-detail-button" data-device-id="' + device.pk + '" data-device-serial="' + device.serial_number + '">ذهاب</a></td></tr>';
                
                body.append(row);
                
            });
            
            $('#total-filter-modal').modal('hide');
            
        }
    });
});

$(document).on('click', '.quick-action', function (e) {
    
    handleQuickAction($(this).attr('data-action'));
    
});

$(document).on('click', '#upload', function (e) {
    
    if (navigator.onLine) {
        swal(
            {
                title: "سيتم رفع البيانات",
                text: "هل تريد المتابعة؟",
                type: "info",

                showCancelButton: true,
                closeOnConfirm: false,
                showLoaderOnConfirm: true
            },

            function () {

                $.ajax({
                    url: '/ajax/upload-data/',

                    success: function (data) {

                        swal("تم رفع البيانات بنجاح", "", "success");
                        
                    },

                    error: generateAlerts

                });
            }
        );
    } else {
        
        iziToast.error({
            title: 'خطأ',
            message: 'لا يتوفر اتصال بالانترنت',
            position: 'topRight',
            zindex: 99999
        });
        
    }
    
});

$(document).on('click', '#download', function (e) {
    
    if (navigator.onLine) {
        swal(
            {
                title: "سيتم تحميل البيانات",
                text: "هل تريد المتابعة؟",
                type: "info",
                className: 'download-popup',

                showCancelButton: true,
                closeOnConfirm: false,
                showLoaderOnConfirm: true
            },

            function () {

                $.ajax({
                    url: '/ajax/download-data/',

                    success: function (data) {

                        swal("تم التحميل بنجاح", "", "success");
                        
                        setTimeout(function () {
                            location.reload();
                        }, 3000);

                    },

                    error: generateAlerts
                    
                });
            }
        );
    } else {
        
        iziToast.error({
            title: 'خطأ',
            message: 'لا يتوفر اتصال بالانترنت',
            position: 'topRight',
            zindex: 99999
        });
        
    }
});

$(document).on('click', '.main-tab', function (e) {
    
    var submenu = tabsAndSubmenus[$(this).attr('id')];
    
    $('.dashboard-submenu').slideUp();
    
    if ($(submenu).is(':hidden')) {
        $(submenu).slideDown();
    }
});

$.ajax({
    url: 'ajax/get-password/',
    
    success: function (data) {
        password = data.password;
    }
});

$(document).on('dblclick', '.editable-locked:not(.empty)', function (e) {
    
    var element = $(this);
    
    var unlockCell = function () {
        
        element
            .attr('contenteditable', true)
            .focus()
            .removeClass('editable-locked')
            .addClass('editable-unlocked');
        
        if (element.attr('data-field-name') === 'notes') {
            element.removeClass('truncate');
        }
        
    }
    
    executeAfterPassword(unlockCell);
    
});

$(document).on('focusout', '.editable-unlocked', function (e) {
    
    var cell = $(this),
        cellType = cell.attr('data-input-type'),
        itemType = cell.parent().parent().parent().attr('data-item-type'),
        fieldName = cell.attr('data-field-name'),
        content = cell.text();

    if (!content) {
        if (cell.hasClass('required')) {

            iziToast.error({
                title: 'خطأ',
                message: 'هذا الحقل مطلوب',
                position: 'topRight',
                zindex: 99999
            });

            cell
                .text('')
                .attr('contenteditable', false)
                .removeClass('editable-unlocked')
                .addClass('editable-locked');

            return;

        }

    } else {

        if (cellType === 'number' && !isNumeric(content)) {

            iziToast.error({
                title: 'خطأ',
                message: 'هذا الحقل يجب أن يكون رقميا',
                position: 'topRight',
                zindex: 99999
            });

            cell
                .attr('contenteditable', false)
                .removeClass('editable-unlocked')
                .addClass('editable-locked');
            
            if (cell.attr('data-value')) {
                cell.text(cell.attr('data-value'));
            }
            
            else {
                cell.text('');
            }

            return;

        }
    }

    if (fieldName === 'formatted_balance_change') {
        content = cell.attr('data-sign') + content;
    }

    $.ajax({
        url: 'ajax/update-cell-content/',

        data: {
            pk: cell.parent().attr('data-pk'),
            type: itemType,
            fieldName: fieldName,
            content: content
        },

        success: function (data) {

            if (itemType === 'maintenance') {
                
                if (data.invalid && (fieldName === 'sparepart_name' || fieldName === 'sparepart_count')) {
                    
                    iziToast.error({
                        title: 'خطأ',
                        message: 'لا توجد قطع غيار كافية من هذا النوع',
                        position: 'topRight',
                        zindex: 99999
                    });
                    
                    cell.text(cell.attr('data-value'));
                    
                    return;
                    
                }
                
                else if (fieldName === 'sparepart_name') {
                    cell.attr('data-value', cell.text());
                }
                
                else if (fieldName === 'notes') {
                    cell.addClass('truncate');
                }
                
                if (data.spareparts && data.spareparts.length) {
                    $.each(data.spareparts, function (index, sparepart) {

                        $('#sparepart-inventory-table tbody tr[data-pk=' + sparepart.pk + '] td[data-field-name=count]').text(sparepart.count);
                        
                        if (!index) {
                            
                            if (sparepart.count < sparepart.minimum_qty) {
                                
                                iziToast.warning({
                                    title: 'تحذير',
                                    message: 'الكمية أقل من الحد الأدنى',
                                    position: 'topRight',
                                    zindex: 99999
                                });
                                
                            }
                            
                        }
                        
                    });
                }

            }

            else if (itemType === 'sparepart') {
                if (data.count_lt_minimum) {

                    iziToast.warning({
                        title: 'تحذير',
                        message: 'الكمية أقل من الحد الأدنى',
                        position: 'topRight',
                        zindex: 99999
                    });
                    
                    cell.parent().children(':nth-child(4)').addClass('expense-td');

                } else {
                    cell.parent().children(':nth-child(4)').removeClass('expense-td');
                }
            }

            else if (itemType === 'expense') {
                
                if (data.current_balance !== undefined) {
                    $('#current-balance-label').text(data.current_balance);
                }
                
                var body = cell.parent().parent();
                
                if (data.new_totals) {
                    $.each(data.new_totals, function (id, total) {
                        body.children('tr[data-pk=' + id + ']').children(':nth-child(7)').text(total);
                    });
                }
                
                var closingTable = $('#todays-closing-table');

                if (closingTable.is(':visible')) {

                    $("#todays-total-revenue").text(data.daily_expense.total_revenue);
                    $("#todays-total-expenses").text(data.daily_expense.total_expenses);
                    $("#todays-closing-total").text(data.daily_expense.closing_balance);

                }
                
                if (data.daily_expense) {
                    updateClosingTable(data.daily_expense);
                }

            }
        },

        error: function (error) {
            
            generateAlerts(error);

            cell.text('');

            cell
                .attr('contenteditable', false)
                .removeClass('editable-unlocked')
                .addClass('editable-locked');
            
            if (fieldName === 'sparepart_name' || fieldName === 'sparepart_count') {
                cell.text(cell.attr('data-value'));
            }
        }
    });

    cell
        .attr('contenteditable', false)
        .removeClass('editable-unlocked')
        .addClass('editable-locked');
});

$(document).on('click keypress', 'input, td', function (e) {
    $(this).removeClass('invalid-input');
});

$(document).on('click', '#confirm-new-password-btn', function (e) {
    
    var pass1 = $('#password'),
        pass2 = $('#password-confirm');
    
    if (!pass1.val() || !pass2.val()) {
        if (!pass1.val()) {
            pass1.addClass('invalid-input');
        }
        
        if (!pass2.val()) {
            pass2.addClass('invalid-input');
        }
        
        iziToast.error({
            title: 'خطأ',
            message: 'يرجى ملأ الحقول الخالية',
            position: 'topRight',
            zindex: 99999
        });
        
        return;
        
    }
    
    if (pass1.val() !== pass2.val()) {
        
        iziToast.error({
            title: 'خطأ',
            message: 'كلمات السر غير متطابقة',
            position: 'topRight',
            zindex: 99999
        });
        
        pass1.addClass('invalid-input');
        pass2.addClass('invalid-input');
        
        return;
        
    }
    
    $.ajax({
        url: 'accounts/ajax/change-password/',
        
        data: {
            password: $('#password').val()
        },
        
        success: function (data) {
            
            password = $('#password').val();
            
            iziToast.success({
                title: 'Success',
                message: 'تم حفظ كلمة السر بنجاح',
                position: 'topRight',
                zindex: 99999
            });
            
            $('#new-password-modal').modal('hide');
            
            if (pendingToUnlockElement) {
                pendingToUnlockElement.attr('contenteditable', true).focus();
                pendingToUnlockElement = null;
            }
            
            if (pendingCallback) {
                pendingCallback();
                pendingCallback = null;
            }
        }
    });
});

startTimer();

function reorderRows(table) {
    
    var body = table.children('tbody'),
        rowCount = body.children().length,
        currentNum = 1;
    
    for (var i=1; i < rowCount; i++) {
        
        var row = body.children('tr[data-row=' + i + ']');
        
        if (row.children(':nth-child(2)').text()) {
            row.children(':first').text(currentNum);
            currentNum += 1;
        }
    }
}

$(document).on('click', '#update', function (e) {
    
    iziToast.info({
        title: '',
        message: 'جار التحديث',
        position: 'topRight',
        zindex: 99999
    });
    
    $.ajax({
        url: '/ajax/update/',
        
        success: function () {
            
            iziToast.success({
                title: 'Success',
                message: 'تم التحديث بنجاح. يرجى اعادة تشغيل البرنامج',
                position: 'topRight',
                zindex: 99999
            });
            
        },
        
        error: generateAlerts
    });
});