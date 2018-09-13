/*globals $, console, iziToast */

//const {ipcRenderer} = require('electron')

$(document).on('click', '#signin-btn', function (e) {
    
    'use strict';
    
    var btn = $(this),
        username = $('#username'),
        password = $('#password'),
        rememberMe = $('#remember-me').is(':checked'),
        data = {
            username: username.val(),
            password: password.val(),
            rememberMe: rememberMe
        };
    
    if (!username.val() || !password.val()) {
        if (!username.val()) {
            username
                .addClass('invalid')
                .attr('placeholder', 'Required');
        }
        if (!password.val()) {
            password
                .addClass('invalid')
                .attr('placeholder', 'Required');
        }
        iziToast.error({
            title: 'خطأ',
            message: 'Please supply missing fields',
            position: 'topRight'
        });
        return;
    }
    
    btn
        .prop('disabled', true)
        .text('Signing in...');
    
    $.ajax({
        url: 'http://localhost:8000/login/',
        data: data,
        success: function (data) {
            btn
                .prop('disabled', false)
                .text('Sign in');
            
            
            //ipcRenderer.send('cookie-setting-channel', username.val());
            
            window.location.href = '/';
            
        },
        error: function (error) {
            btn
                .prop('disabled', false)
                .text('Sign in');
            
            var data = JSON.parse(error.responseText);
            
            if (data.invalid_username) {
                iziToast.error({
                    title: 'خطأ',
                    message: 'Incorrect Username',
                    position: 'topRight'
                });
                $('#username')
                    .addClass('invalid')
                    .attr('placeholder', 'Invalid Username')
                    .val('');
            }

            if (data.invalid_password) {
                iziToast.error({
                    title: 'خطأ',
                    message: 'Incorrect Password',
                    position: 'topRight'
                });
                $('#password')
                    .addClass('invalid')
                    .attr('placeholder', 'Invalid Password')
                    .val('');
            }
        }
    });
});

$(document).on('keypress', 'input', function (e) {
    
    'use strict';
    
    $(this)
        .removeClass('invalid')
        .attr('placeholder', $(this).attr('name'));
    
});
