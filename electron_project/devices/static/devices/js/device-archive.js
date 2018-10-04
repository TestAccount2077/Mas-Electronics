var currentView = 'device-archive';

$.ajax({
    url: 'ajax/get-device-archive-data/',
    
    success: function (data) {
        
        $.each(data.archive_devices, function (i, device) {
            
            var element = `<tr data-serial="${ device.serial_number }" data-receipt-pk="${ device.delivery_receipt_id }">
                                <td></td>
                                <td>${ (i + 1) }</td>
                                <td>${ device.serial_number }</td>
                                <td data-company="${ device.company_name }">${ device.company_name }</td>
                                <td data-type="${ device.device_type }" data-pk="${ device.pk }">${ device.device_type }</td>
                                <td>${ device.leave_date }</td>
                                <td><img class="icon" src="${ device.in_inventory_icon }"></td>
                                <td><a href="#device-detail" class="device-detail-button" data-device-id="${ device.pk }" data-device-serial="${ device.serial_number }">ذهاب</a></td>
                            </tr>`;
            
            $('#device-archive-table tbody').append(element);
            
        });
    }
});

$(document).ready(function () {
    
    $('.extra-separator, #receive').show();
    
    $('#archive-submenu')
        .show()
        .children().children(':first').addClass('active');
    
    var deviceArchiveSelection = new Selectables({
        elements: 'tr td:nth-child(3)',
        zone: '#device-archive-table tbody',
        moreUsing: 'ctrlKey'
    });
    
});

$(document).on('mousedown', '.device-detail-button', function (e) {
    location.href = '../' + $(this).data('device-serial');
});