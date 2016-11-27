(function (angular) {

    angular.module('app')
        .service('Utility', ['appConfig', 'UserConfigurationService', function (appConfig, UserConfigService) {
            var toFindValues = [];

            //registering prototypes
            String.prototype.replaceAt = function (index, character) {
                return this.substr(0, index) + character + this.substr(index + character.length);
            };
            ////////////////////

            this.getObjectKey = function (obj, index) {
                var keys = Object.keys(obj);
                return keys[index];
            };
            this.getObjectValue = function (obj, index) {
                return obj[this.getKey(obj, index)];
            };
            this.removeSpace = function (val) {
                return val.replace(/ /g, '');
            };
            this.getControlType = function (val) {

                switch (val) {
                    case "text":
                        return "text";
                        break;
                    default:
                        return val;
                        break;
                }
            };
            this.adjustText = function (text) {

                var values = appConfig.staticNames;

                text = text.replace(/([A-Z])/g, ' $1').replace(/^./, function (str) {
                    return str.toUpperCase();
                });
                text = text.trim();
                if (toFindValues.length != values.length * 4) {
                    angular.forEach(values, function (v, i) {
                        var toFind = "";

                        for (i = 0; i < v.length; i++) {
                            toFind += v[i] + " ";
                        }
                        toFindValues.push(toFind);
                        toFindValues.push(" " + toFind);
                        toFindValues.push(" " + toFind.trim());
                        toFindValues.push(toFind.trim());
                        toFind = "";


                    })
                }
                for (i = 0; i < toFindValues.length; i++) {
                    var indexTarget = text.indexOf(toFindValues[i]);
                    if (indexTarget >= 0 && (text[indexTarget + toFindValues[i].length] == ' ' || text[indexTarget + toFindValues[i].length] == undefined)) {
                        switch (i % 4) {
                            case 0:
                                text = text.replace(toFindValues[i], values[Math.floor(i / 4)]);
                                break;
                            case 1:
                            case 2:
                                text = text.replace(toFindValues[i], " " + values[Math.floor(i / 4)]);
                                break;
                            case 3:
                                text = text.replace(toFindValues[i], values[Math.floor(i / 4)]);
                                break;
                        }
                        text = text.trim();
                    }
                }
                return text;
            };
            this.getHeading = function (item) {

                var heading = item.heading || '';
                heading = this.adjustText(heading);
                return heading;
            };
            this.getLabel = function (item) {
                var label = item.label;
                if (!label) {
                    label = item.name;
                }
                label = this.adjustText(label);
                if (label.indexOf("V_") == 0 && label.length > 3) {
                    label = label[2].toUpperCase() + label.substring(3);
                    label = label.trim();
                }
                return label;
            };
            this.getValue = function (item) {
                return item.value;
            };
            this.getMask = function (item) {
                //https : //github.com/angular-ui/ui-mask
                //A Any letter.
                //9 Any number.
                //* Any letter or number.
                //? Make any part of the mask optional.


                if (item.mask) {
                    return item.mask;
                }
                else {
                    switch ((item.paramType && item.paramType.toUpperCase()) || (item.paramtype && item.paramtype.toUpperCase())) {
                        case "TEXT":
                            return UserConfigService.settings.mask.text || '';
                            break;
                        case "PHONE":
                            return UserConfigService.settings.mask.phone || '(999) 999-9999';
                            break;
                    }
                }
            };

            this.secondsToTime = function (timeValue) {

                if (timeValue == null || timeValue == "" && timeValue != 0) {
                    return " ";
                } else if (timeValue == 86400) {
                    return "24:00";
                } else {

                    if (timeValue >= 86400) {

                        var dayInteger = parseInt(timeValue / 86400);
                        var timeValue = timeValue - dayInteger * 86400;
                    }

                    var minutes = parseInt((timeValue / 60) % 60);
                    var hours = parseInt((timeValue / 3600) % 24);
                    var minutesStr = parseInt((minutes < 10 ? "0" : "") + minutes);
                    var hoursStr = parseInt((hours < 10 ? "0" : "") + hours);
                    return hoursStr + ":" + minutesStr;
                }
            };

            this.secondsToDay = function (timeValue) {

                if (timeValue > 6) {

                    var dayInteger = parseInt(timeValue / 86400);

                } else {

                    dayInteger = timeValue
                }

                var dayName = " "

                if (dayInteger == 0)
                    dayName = "Saturday";
                if (dayInteger == 1)
                    dayName = "Sunday";
                if (dayInteger == 2)
                    dayName = "Monday";
                if (dayInteger == 3)
                    dayName = "Tuesday";
                if (dayInteger == 4)
                    dayName = "Wednesday";
                if (dayInteger == 5)
                    dayName = "Thursday";
                if (dayInteger == 6)
                    dayName = "Friday";

                return dayName;
            };

            this.translateVoucherState = function (code) {
                switch (code) {
                    case 0:
                        return "FRESH/INACTIVE"
                    case 5:
                        return "STOLEN"
                    case 12:
                        return "SOLD"
                    case 16:
                        return "ACTIVATED"
                    case 18:
                        return "PURGED"
                    case 17:
                        return "CANCELLED"
                    default:
                        return "Unknown"
                }
            };
        }]);
})(window.angular);
