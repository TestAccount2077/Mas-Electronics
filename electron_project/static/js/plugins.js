(function ( $ ) {
    
    $.fn.resetModal = function (options) {
        
        /*
        Modal reset functionality
        
        NOTE: Inputs must be of type "text" or "password".
        Switch other types to one of these two types before using this method.
        
        Usage
        
        Example 1 (A modal with inputs only):
        
        $('#modal-selector').resetModal();
        
        Example 2 (A modal with inputs that some of which have default values):
        
        $('#modal-selector').resetModal({
            defaultValues: {
                '#element-selector-1': 'default-value-1',
                '.element-selector-2': 'default-value-2'
            }
        });
        
        Example 3 (A modal with inputs and Redactor fields. Still under work)
        
        $('#modal-selector').resetModal({
            redactorFields: ['#redactor-field-1', '#redactor-field-2']
        });
        
        */

        this.find('input:text, input:password').val('');

        var settings = $.extend(
            {
                defaultValues: {},
                redactorFields: []
            },
            options
        );
        
        var This = this;
        
        $.each(settings.defaultValues, function (selector, value) {
            This.find(selector).val(value);
        });
        
        return this;
        
    }
    
    $.fn.slideAndRemove = function (options) {
        
        var settings = $.extend(
            {
                removeNext: false
            },
            options
        );
        
        var element = this;
        
        this.slideUp(function () {

            if (settings.removeNext) {
                element.next().remove();
            }
            
            element.remove();
            
        });
    }
    
    $.fn.addAndSlide = function (options) {
        
        var settings = $.extend(
            {
                action: 'append'
            },
            options
        );
        
        if (!options.container) {
            throw Error('container option is required');
        }
        
        this.hide();
        
        if (settings.action === 'append') {
            settings.container.append(this);
        }
        
        else if (settings.action === 'prepend') {
            settings.container.prepend(this);
        }
        
        else if (settings.action === 'before') {
            settings.container.before(this);
        }
        
        this.slideDown();
        
        return this;
        
    }
    
    $.fn.disable = function (options) {
        
        var settings = $.extend(
            {
                changeText: true
            },
            options
        );
        
        this.prop('disabled', true);
        
        if (settings.changeText){
            this.text(this.data('loading-text'));
        }
        
        return this;
        
    }
    
    $.fn.enable = function (options) {
        
        var settings = $.extend(
            {
                changeText: true
            },
            options
        );
        
        this.prop('disabled', false);
        
        if (settings.changeText) {
            this.text(this.data('normal-text'));
        }
        
        return this;
        
    }
    
    $.fn.print = function (options) {
        
        var settings = $.extend(
            {
                orientation: 'portrait'
            },
            options
        );
        
        if (settings.orientation === 'portrait') {
            
        }
        
        else {
            
        }
        
        return this;
        
    }
 
}( jQuery ));
