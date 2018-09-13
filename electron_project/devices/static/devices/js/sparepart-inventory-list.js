var currentView = 'sparepart-inventory';


$(document).ready(function () {
    
    $('#devices-submenu')
        .show()
        .children().children(':nth-child(3)').addClass('active');
    
});

$(document).on('click', '#sparepart-save-btn', function (e) {
    
    var btn = $(this),
        row = btn.parent().parent(),
        name = row.children(':nth-child(3)').text(),
        count = row.children(':nth-child(4)').text(),
        minimum = row.children(':nth-child(5)').text();
    
    if (!name || !count || !minimum) {
        
        iziToast.error({
            title: 'خطأ',
            message: 'يرجى ملأ الحقول الخالية',
            position: 'topRight',
            zindex: 99999
        });
        
        return;
        
    }
    
    if (!isNumeric(count) || !isNumeric(minimum)) {
        if (!isNumeric(count) && !isNumeric(minimum)) {
            
            iziToast.error({
                title: 'خطأ',
                message: 'الكمية والحد الأدنى يجب أن تكون رقمية',
                position: 'topRight',
                zindex: 99999
            });
            
            return;
            
        }
        
        if (!isNumeric(count)) {
            
            iziToast.error({
                title: 'خطأ',
                message: 'الكمية يجب أن تكون رقمية',
                position: 'topRight',
                zindex: 99999
            });
            
        }
        
        if (!isNumeric(minimum)) {
            
            iziToast.error({
                title: 'خطأ',
                message: 'الحد الأدنى يجب أن يكون رقميا',
                position: 'topRight',
                zindex: 99999
            });
            
        }
        
        return;
        
    }
    
    $.ajax({
        url: 'devices/ajax/create-sparepart/',
        type: 'POST',
        
        data: {
            name: name,
            count: count,
            minimum: minimum
        },
        
        success: function (sparepart) {
            
            if (sparepart.count_lt_minimum) {
                
                iziToast.warning({
                    title: 'تحذير',
                    message: 'الكمية أقل من الحد الأدنى',
                    position: 'topRight',
                    zindex: 99999
                });
            }
            
            row.children(':last').append('<img src="/static/images/remove.png" class="icon remove-sparepart" data-pk="' + sparepart.pk + '">');
            
            row.attr('data-pk', sparepart.pk);
            
            row.children(':nth-child(3), :nth-child(4), :nth-child(5)')
                .attr('contenteditable', false)
                .addClass('editable-locked');
            
            row.children(':nth-child(4)').addClass(sparepart.count_lt_min_class);
            
            row.children(':nth-child(6)').children().remove();
            
            row.children(':nth-child(6)').append('<a href="#">ذهاب</a>');
            
            row.children(':nth-child(2)').text(row.parent().children().length);
            
            var newLastRow = $('<tr></tr>');
            
            newLastRow.append(
                '<td></td><td></td><td data-input-type="text" data-field-name="name" style="height:38px"' +
                'contenteditable="true"></td>' +
                '<td data-input-type="number" data-field-name="count" contenteditable="true"></td>' +
                '<td data-input-type="number" data-field-name="minimum_qty" contenteditable="true"></td>' + '<td><a href="#" id="sparepart-save-btn">حفظ</a>' +
                '</td><td></td>'
            );
            
            row.after(newLastRow);
            
        },
        
        error: generateAlerts
    });
});

$(document).on('click', '.remove-sparepart', function (e) {
    
    var btn = $(this);
    
    var deleteSparepart = function () {
        
        var row = btn.parent().parent(),
            pk = row.attr('data-pk');
        
        $.ajax({
            url: 'devices/ajax/delete-sparepart/',
            
            data: {
                pk: pk
            },
            
            success: function (data) {
                
                row.fadeOut(300, function () {
                    $(this).remove();
                });
                
                // Re-ordering Table
                
                setTimeout(function () {
                    reorderTableCounters('#sparepart-inventory-table tbody tr:not(:last)');
                }, 500);
                
            },
            
            error: generateAlerts
        });
    }
    
    executeAfterPassword(deleteSparepart);
});