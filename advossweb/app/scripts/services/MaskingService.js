(function (angular) {
    var scripts = document.getElementsByTagName("script")
    var currentScriptPath = scripts[scripts.length - 1].src;

    angular.module('app')
        .service('MaskingService', ['appConfig', function (appConfig) {

            this.replaceAt = function (index, character) {
                return this.substr(0, index) + character + this.substr(index + character.length);
            }

            this.maskedOutput = function (data, mask) {

                //mask=  "$(999) 999-9999";
                mask = mask.replace(/9/g, '?');
                mask = mask.replace(/A/g, '?');
                mask = mask.replace(/\*/g, '?');
                var result = mask;
                data = data.toString().trim();
                var orignalData = data;
                var dataCounter = 0;
                for (var i = 0; i < mask.length; i++) {
                    if (mask[i] == '?') {
                        result = result.replaceAt(i, (data[dataCounter] || ' '));
                        dataCounter++;
                    }
                    else if (mask[i] == undefined) {
                        result = result + (data[dataCounter] || '');
                        dataCounter++;
                    }
                }

                return result;


            }

        }]);


})(window.angular);