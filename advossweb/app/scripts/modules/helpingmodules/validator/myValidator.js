(function (angular) {

    angular.module('app')
        .directive('validator', ['Session', 'myValidatorService', function (Session, myValidatorService) {


            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    element[0].onblur = element[0].onchange = function () {
                        myValidatorService.validate(element[0], attrs['validator']);
                    };
                }
            }
        }])
        .service('myValidatorService', function () {
            var self = this;
            this.expression = {
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
                positiveNumberOptional: function (value, scope, element, attrs, param) {

                    var toValidate = "1234567890.";
                    if (value == null || value == "") {
                        return true;
                    }
                    else {
                        for (var c = 0; c < value.length; c++) {
                            if (toValidate.indexOf(value[c]) == -1) {
                                return false;
                            }
                        }
                    }
                    return true;
                },
                empty: function (value, scope, element, attrs, param) {
                    return true;
                }
            };
            this.defaultMsg = {
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
                    error: 'test error',
                    success: 'test success'
                }
            };
            this.validate = function (element, expression) {
                if (element == undefined) {
                    return true;
                }
                if (!expression && element.attributes['validator'] == undefined) {
                    return true;
                }
                if (!expression) {
                    expression = element.attributes['validator'].value;
                }
                var validationCheckExpressions = expression.split(',');
                var validationResult = true;
                var i = 0;
                while (i < validationCheckExpressions.length && validationResult) {
                    var _expression = validationCheckExpressions[i].trim();
                    var testFunction = this.expression[_expression];
                    i++;
                    var valuetoTest = element.value;

                    if (typeof (testFunction) == "string" || typeof (testFunction) == "object") {
                        var patt = new RegExp(testFunction);
                        validationResult = patt.test(valuetoTest);
                    }
                    else {
                        validationResult = testFunction(valuetoTest);
                    }

                    var msg = this.defaultMsg[_expression].error;
                    element.showError = !validationResult;
                    if (element.showError) {
                        if (element.errorDiv) {
                            element.errorDiv.remove();
                            element.errorDiv = null;
                        }
                        var element1 = angular.element("<label class=\"error-label has-error\">" + msg + "</label>");
                        angular.element(element).after(element1);
                        element.errorDiv = element1;
                    }
                    else {
                        element.showError = false;
                        if (element.errorDiv) {
                            element.errorDiv.remove();
                            element.errorDiv = null;
                        }
                    }
                }
                return validationResult;

            };
            this.validateForm = function (formElement) {
                var isFormValidated = true;
                angular.element('input[validator]', formElement).each(function (i, ele) {

                    if (!self.validate(ele)) {
                        isFormValidated = false;
                    }

                });
                return isFormValidated;
            }
        })

})(window.angular);