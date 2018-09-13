var currentView = 'device-archive';

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