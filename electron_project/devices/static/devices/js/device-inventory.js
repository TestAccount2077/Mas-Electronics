var currentView = 'device-inventory',
    
    deviceInventorySelection;

$(document).ready(function () {
    
    deviceInventorySelection = new Selectables({
        elements: 'tr td:nth-child(3)',
        zone: '#device-inventory-table tbody',
        moreUsing: 'ctrlKey'
    });
    
    $('.extra-separator, #deliver').show();
    
    $('#devices-submenu')
        .show()
        .children().children(':first').addClass('active');
    
});

$(document).on('mousedown', '.device-detail-button', function (e) {
    location.href = '../' + $(this).data('device-serial');
});
