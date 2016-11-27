(function (angular) {
    

    angular.module('app')
    .factory('customFunctions', ['notify', function (notify) {

        var customFunctions = {};

        customFunctions.getLiveIP = function (value, scope) {            
            $.ajax({
                type: 'GET',
                url: 'http://jsonip.com',
                dataType: 'json',
                async: false,
                success:function(result){
                    value.value = result.ip;
                }
            });
        };

        customFunctions.matchEqualtest = function (param, form) {
        	debugger;
        	var isMatched = false;
        	var matcherrortoast = "";
        	if (param.value && param.matchwith) {
        		$.each(form.data.Params, function (i, k) {
        			if (param.matchwith == k.name) {
        				isMatched = k.value == param.value ? true : false;
        				return false;
        			}
        		});
        	}
        	else {
        		isMatched = true;
        	}
        	if (!isMatched)
        	{
        		notify.error(param.matcherrortoast);
        	}
        	return isMatched;
        };
        return customFunctions;

    }]);
})(window.angular);
