(function () {
    angular.module('validation.rule', ['validation'])
        .config(['$validationProvider',
            function ($validationProvider) {

                var expression = {
                    required: function (value) {
                        return !!value;
                    },
                    url: /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/,
                    email: /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/,
                    number: /^\d+$/,
                    minlength: function (value, scope, element, attrs, param) {
                        return value.length >= param;
                    },
                    maxlength: function (value, scope, element, attrs, param) {
                        return value.length <= param;
                    },
                    positiveNumberRequired: /^[+]?[0-9]{1,9}(?:\.[0-9]{1,3})?$/,
                    positiveNumberOptional: /^[+]?[0-9]{1,9}(?:\.[0-9]{1,3})?$/,
                    empty: function (value, scope, element, attrs, param) {
                        return true;
                    }
                };

                var defaultMsg = {
                    required: {
                        error: '*',
                        success: 'It\'s Required'
                    },
                    url: {
                        error: 'This should be Url',
                        success: 'It\'s Url'
                    },
                    email: {
                        error: 'This should be Email',
                        success: 'It\'s Email'
                    },
                    number: {
                        error: 'This should be Number',
                        success: 'It\'s Number'
                    },
                    minlength: {
                        error: 'This should be longer',
                        success: 'Long enough!'
                    },
                    maxlength: {
                        error: 'This should be shorter',
                        success: 'Short enough!'
                    },
                    positiveNumberRequired: {
                        error: 'This must be a positive number and Accept only 3 Decimal places'
                    },
                    positiveNumberOptional: {
                        error: 'This must be a positive number and Accept only 3 Decimal places'
                    },
                    empty: {
                        error: '',
                        success: ''
                    }
                };

                $validationProvider.setErrorHTML(function (msg) {
                    return "<label class=\"error-label has-error\">" + msg + "</label>";
                });
                angular.extend($validationProvider, {
                    validCallback: function (element) {
                        $(element).parents('.form-group:first').removeClass('has-error');
                        $(element).removeClass('error-focus');
                    },
                    invalidCallback: function (element) {
                        $(element).parents('.form-group:first').addClass('has-error');
                        $(element).addClass('error-focus');
                    }
                });

                $validationProvider.setExpression(expression).setDefaultMsg(defaultMsg);
                $validationProvider.showSuccessMessage = false;

            }
        ]);

}).call(this);
