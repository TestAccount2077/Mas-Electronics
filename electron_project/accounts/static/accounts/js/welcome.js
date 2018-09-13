/*global $, console*/

const {ipcRenderer} = require('electron')

var username = ipcRenderer.sendSync('cookie-getting-channel', '');

$(document).ready(function () {
    
    'use strict';
    
    setTimeout(function () {
        $('.sk-cube-grid').fadeOut(700, function () {
            
            $('.welcome-message')
                .text('Welcome, ' + username)
                .fadeIn(700, function () {
                    $('.get-started').fadeIn(500);
            }   );
            
        });
    }, 3000);
    
    $('.get-started').click(function () {
        $('.message-container').fadeOut(500, function () {
            window.location.href = 'dashboard.html';
        });
    })
    
});
