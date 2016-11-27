(function (angular) {

    'use strict';

    var scripts = document.getElementsByTagName("script")
    var currentScriptPath = scripts[scripts.length - 1].src;

    angular.module("app")
        .directive("createAgentDirective", ['$state', '$timeout', 'DataService', 'notify', function (state, timeout, DataService, notify) {
            return {
                templateUrl: currentScriptPath.replace('createAgent.js', 'createAgent.html'),
                controller: function ($scope, $location, DataService, EmailService) {
                    $scope.displayPopUp = 'none';
                    var fieldsetCount = $('#formElem').children().length;

                    /*
                     current position of fieldset / navigation link
                     */
                    var current = 1;

                    /*
                     sum and save the widths of each one of the fieldsets
                     set the final sum as the total width of the steps element
                     */
                    var stepsWidth = 0;
                    var widths = new Array();
                    $('#steps .step').each(function (i) {
                        var $step = $(this);
                        widths[i] = stepsWidth;
                        stepsWidth += $step.width();
                    });
                    $('#steps').width(stepsWidth);

                    /*
                     to avoid problems in IE, focus the first input of the form
                     */
                    $('#formElem').children(':first').find(':input:first').focus();

                    /*
                     show the navigation bar
                     */
                    $('#navigation').show();

                    /*
                     when clicking on a navigation link
                     the form slides to the corresponding fieldset
                     */
                    $('#navigation a').bind('click', function (e) {
                        var $this = $(this);
                        var prev = current;
                        $this.closest('ul').find('li').removeClass('selected');
                        $this.parent().addClass('selected');
                        /*
                         we store the position of the link
                         in the current variable
                         */
                        current = $this.parent().index() + 1;
                        /*
                         animate / slide to the next or to the corresponding
                         fieldset. The order of the links in the navigation
                         is the order of the fieldsets.
                         Also, after sliding, we trigger the focus on the first
                         input element of the new fieldset
                         If we clicked on the last link (confirmation), then we validate
                         all the fieldsets, otherwise we validate the previous one
                         before the form slided
                         */
                        $('#steps').stop().animate({
                            marginLeft: '-' + widths[current - 1] + 'px'
                        }, 500, function () {
                            if (current == fieldsetCount)
                                validateSteps();
                            else
                                validateStep(prev);
                            $('#formElem').children(':nth-child(' + parseInt(current) + ')').find(':input:first').focus();
                        });
                        e.preventDefault();
                    });
                    $('.btnNextTab').bind('click', function (e) {
                        var $this = $(this);
                        var prev = current;
                        $this.closest('ul').find('li').removeClass('selected');
                        $this.parent().addClass('selected');


                        current = current + 1;
                        /*
                         animate / slide to the next or to the corresponding
                         fieldset. The order of the links in the navigation
                         is the order of the fieldsets.
                         Also, after sliding, we trigger the focus on the first
                         input element of the new fieldset
                         If we clicked on the last link (confirmation), then we validate
                         all the fieldsets, otherwise we validate the previous one
                         before the form slided
                         */
                        $('#steps').stop().animate({
                            marginLeft: '-' + widths[current - 1] + 'px'
                        }, 500, function () {
                            if (current == fieldsetCount)
                                validateSteps();
                            else
                                validateStep(prev);
                            $('#formElem').children(':nth-child(' + parseInt(current) + ')').find(':input:first').focus();
                        });
                        e.preventDefault();
                    });

                    /*
                     clicking on the tab (on the last input of each fieldset), makes the form
                     slide to the next step
                     */
                    $('#formElem > fieldset').each(function () {
                        var $fieldset = $(this);
                        $fieldset.children(':last').find(':input').keydown(function (e) {
                            if (e.which == 9) {
                                $('#navigation li:nth-child(' + (parseInt(current) + 1) + ') a').click();
                                /* force the blur for validation */
                                $(this).blur();
                                e.preventDefault();
                            }
                        });
                    });

                    /*
                     validates errors on all the fieldsets
                     records if the Form has errors in $('#formElem').data()
                     */
                    function validateSteps() {
                        var FormErrors = false;
                        for (var i = 1; i < fieldsetCount; ++i) {
                            var error = validateStep(i);
                            if (error == -1)
                                FormErrors = true;
                        }
                        $('#formElem').data('errors', FormErrors);
                    }

                    /*
                     validates one fieldset
                     and returns -1 if errors found, or 1 if not
                     */
                    function validateStep(step) {

                        if (step == fieldsetCount) return;

                        var error = 1;
                        var hasError = false;
                        $('#formElem').children(':nth-child(' + parseInt(step) + ')').find(':input:not(button)').each(function () {
                            var $this = $(this);
                            var valueLength = jQuery.trim($this.val()).length;

                            if (valueLength == '' && $this.hasClass("requird")) {
                                hasError = true;
                                $this.css('background-color', '#FFEDEF');
                            }
                            else
                                $this.css('background-color', '#FFFFFF');
                        });
                        var $link = $('#navigation li:nth-child(' + parseInt(step) + ') a');
                        $link.parent().find('.error,.checked').remove();

                        var valclass = 'checked';
                        if (hasError) {
                            error = -1;
                            valclass = 'error';
                        }
                        $('<span class="' + valclass + '"></span>').insertAfter($link);

                        return error;
                    }

                    /*
                     if there are errors don't allow the user to submit
                     */
                    $('#registerButton').bind('click', function () {
                        if ($('#formElem').data('errors')) {
                            alert('Please correct the errors in the Form');
                            return false;
                        }

                        //alert("Charges   " + parseFloat($("#totalAmountTopay").val())+"Balance  :  "+parseFloat($("#amount").val()));


                    });
                    $scope.IPs = []
                    $scope.addIP = function () {
                        $scope.IPs.push({})
                    }
                    $scope.createAgent = function () {
                        DataService.TX_AddAgent($scope.CustomerName, $scope.DomainName, $scope.CurrencyID)
                            .then(function (response) {
                                if (response.v_ReturnCode == "0") {
                                    notify.success("Agent Created Successfully.");
                                    $scope.to = $scope.Email;
                                    $scope.subject = "Agent creation";
                                    $scope.content = "Agent is created";
                                    EmailService.email($scope);
                                    DataService.TX_InsertAgentContact(1, null, $scope.CustomerName, $scope.Address, $scope.City, $scope.State, $scope.Country, $scope.Tel, $scope.MobileNumber, null, $scope.Fax, $scope.PostalCode, $scope.CompanyName)
                                        .then(function (response) {
                                            if (response.v_ReturnCode == "0") {
                                                notify.success("Primary Contact added Successfully.");

                                            }
                                        });
                                    if ($scope.billingContactPerson != undefined) {
                                        DataService.TX_InsertAgentContact(2, $scope.billingEmail, $scope.billingContactPerson, null, null, null, null, null, null, null, null, null, null)
                                            .then(function (response) {
                                                if (response.v_ReturnCode == "0") {
                                                    notify.success("Billing Contact added Successfully.");

                                                }
                                            });
                                    }
                                    if ($scope.pricingContactPerson != undefined) {
                                        DataService.TX_InsertAgentContact(3, $scope.pricingEmail, $scope.pricingContactPerson, null, null, null, null, null, null, null, null, null, null)
                                            .then(function (response) {
                                                if (response.v_ReturnCode == "0") {
                                                    notify.success("pricing Contact added Successfully.");

                                                }
                                            });
                                    }
                                    if ($scope.supportContactPerson != undefined) {
                                        DataService.TX_InsertAgentContact(4, $scope.supportEmail, $scope.supportContactPerson, null, null, null, null, null, null, null, null, null, null)
                                            .then(function (response) {
                                                if (response.v_ReturnCode == "0") {
                                                    notify.success("Support Contact added Successfully.");

                                                }
                                            });
                                    }
                                    if ($scope.commercialContactPerson != undefined) {
                                        DataService.TX_InsertAgentContact(5, $scope.commercialEmail, $scope.commercialContactPerson, null, null, null, null, null, null, null, null, null, null)
                                            .then(function (response) {
                                                if (response.v_ReturnCode == "0") {
                                                    notify.success("Commercial Contact added Successfully.");
                                                }
                                            });
                                    }
                                    if ($scope.IPs.length >= 0) {
                                        for (i = 0; i <= $scope.IPs.length; i++) {
                                            $scope.ip = $scope.IPs[i];
                                            DataService.TX_InsertAgentIPAddress($scope.ip)
                                                .then(function (response) {
                                                    if (response.v_ReturnCode == "0") {
                                                        notify.success("IP Address added Successfully.");
                                                    }
                                                });
                                        }
                                    }
                                }
                            });
                    }
                }
            };
        }]);
})(window.angular);
