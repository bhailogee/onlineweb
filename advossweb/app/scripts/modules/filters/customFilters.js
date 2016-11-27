(function (angular) {

    var app = angular.module('app');

    app.filter('datasourceFilter', function () {
        return function (param) {
            if (param) {
                if (param.datasource) {
                    for (var i = 0; i < param.datasource.length; i++) {
                        if (param.value == param.datasource[i][param.valuefield || 'ID']) {
                            return param.datasource[i][param.textfield || 'value'];
                        }
                    }
                }
                return param.value;
            }
            return null;
        };
    });
    app.filter('bytestomb', function () {
        return function (param) {
            debugger;
            return (param.value / 1048576);
        };
    });
    app.filter('mbtobytes', function () {
        return function (param) {
            debugger;
            return (param.value * 1048576);
        };
    });
    app.filter('treefilter', function () {
        return function (list, searchString) {
            if (searchString) {
                var results = JSON.parse(JSON.stringify(list));
                for (var f = list.length - 1; f >= 0; f--) {
                    for (var g = list[f].child.length - 1; g >= 0; g--) {
                        for (var h = list[f].child[g].child.length - 1; h >= 0; h--) {
                            if (JSON.stringify(list[f].child[g].child[h]).toUpperCase().indexOf(searchString.toUpperCase()) == -1) {
                                results[f].child[g].child.splice(h, 1);
                            }
                        }
                        if (results[f].child[g].child.length == 0) {
                            results[f].child.splice(g, 1);
                        }
                    }
                    if (results[f].child.length == 0) {
                        results.splice(f, 1);
                    }
                }
                return results;
            }
            else {
                return list;
            }
        };
    });

})(angular);