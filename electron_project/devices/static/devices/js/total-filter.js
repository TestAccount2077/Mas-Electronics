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
