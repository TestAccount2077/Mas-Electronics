

$(document).ready(function () {
    
    $('.attendance-input').datetimepicker({
        format: 'hh:mm a'
    });
    
});

$(document).on('keypress', '#daily-attendance-table tbody tr:last td.empty:first, td.empty:nth-child(2), td.empty:nth-child(3)', function (e) {
    
    var cell = $(this),
        row = cell.parent(),
        serialNumber = cell.text(),
        key = e.which;
    
    if (key === 13) {
        
        var name = row.children(':first'),
            attendanceTime = row.children(':nth-child(2)'),
            leaveTime = row.children(':nth-child(3)');
        
        if (!name.text() || !attendanceTime.text() || leaveTime.text()) {
            
            runFieldsRequiredNotification();
            
            cell.blur();
            
            return;
            
        }
        
        var data = {
            name: name.text(),
            attendanceTime: attendanceTime.text(),
            leaveTime: leaveTime.text()
        }
        
        cell.blur();
        
        $.ajax({
            url: 'attendance/ajax/create-attendance/',
            type: 'POST',
            
            data: data,
            
            success: function (data) {
                                
                var element = $('#daily-expenses-table tbody tr:last');
                
                // Setting date direction to LTR
                element.children('td[date-field-name=attendance_time], td[data-field-name=leave_time]').attr('dir', 'ltr');
                
                // Adding and rendering backend-calculated fields
                $.each(data.attendance, function (key, value) {
                    element.children('td[data-field-name=' + key + ']').text(value);
                });
                
                // Disabling editable cells
                element.children('td:first, td:nth-child(2), td:nth-child(3)').attr('contenteditable', false).removeClass('empty');
                
                // Adding pk attr to new row
                element.attr('data-pk', data.attendance.id);
                
                // Adding remove button
                element.children(':last').append('<img src="/static/images/remove.png" class="icon remove-attendance-item" data-pk="' + data.attendance.id + '">');
                
                // Adding the new empty row
                element.after('<tr>' +
                                '<td class="editable-locked empty" data-field-name="formatted_balance_change" data-input-type="number" data-sign="-" style="height:38px" contenteditable="true"></td>' +
                                '<td class="editable-locked empty" data-field-name="formatted_balance_change" data-input-type="number" data-sign="+" contenteditable="true"></td>' +
                                '<td class="editable-locked empty" data-field-name="name" data-input-type="text" contenteditable="true"></td>' +
                                '<td data-field-name="created"></td>' +
                                '<td class="editable-locked empty" data-field-name="total_after_change" data-input-type="number"></td>' +
                                '<td></td></tr>'
                );
            },
            
            error: function (error) {
                
                generateAlerts(error);
                
                cell
                    .blur()
                    .html('');
            } 
        });
    }
});
