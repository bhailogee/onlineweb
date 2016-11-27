(function (angular) {
    var scripts = document.getElementsByTagName("script")
    var currentScriptPath = scripts[scripts.length - 1].src;

    angular.module('app')
    .directive('listpanelDirective', ['ModelHolderService', 'Utility', 'SchemaService', 'ModelsService', 'DataService', 'listHelperService', 'Dependent', 'customFunctions', function (ModelHolderService, utility, SchemaService, ModelsService, ds, listHelperService, Dependent, customFunctions) {


        return {
            templateUrl: currentScriptPath.replace('listpanel.js', 'listpanel.html'),
            controller: function ($scope, $location) {
                $scope.listpanel = {};
                $scope.SchemaService = SchemaService;
                $scope.Utility = utility;                

                if (!$scope.viewObject) {
                    if ($scope.viewName) {
                        $scope.viewObject = SchemaService.getViewObjectDotNotation($scope.viewName);
                    }
                }
                $scope.refreshPanel = function () {
                    
                    if ($scope.sourcedata) {
                        $scope.populateListpanel($scope.sourcedata);
                    }
                    else {
                        //if source data is not supplied than one must enter the tab index where this panel is located, this will only be executed if activetab index is equal to its tab index
                        if ($scope.tabindex != $scope.dashboard.activeTab) {
                            return false;
                        }
                        ds[$scope.viewObject.apiName]([$scope.requestParams]).then(function (n) {                            
                            $scope.populateListpanel(n.rows);
                            if ($scope.viewObject && $scope.viewObject.pagination && $scope.viewObject.pagination.paramTotalItemCount) {
                                $scope.listpanel.gridOpts.totalItems = n[$scope.viewObject.pagination.paramTotalItemCount] || n.rows.length || 0;
                            }
                        });
                    }
                }

                $scope.populateListpanel = function (_nData) {
                    $scope.$emit('viewResult', { viewName: $scope.viewObject.apiName, data: _nData });
                    $scope.listpanel.gridOpts = {};
                    $scope.listpanel.gridOpts.data = _nData;
                    angular.extend($scope.listpanel.gridOpts, $scope.viewObject.gridOptions);

                    $scope.listpanel.gridOpts.enableFiltering = true;
                    $scope.listpanel.gridOpts.enableGridMenu = true;
                    var pdfo = {
                        enableSelectAll: true,
                        exporterPdfDefaultStyle: { fontSize: 9 },
                        exporterPdfTableStyle: { margin: [30, 30, 30, 30] },
                        exporterPdfTableHeaderStyle: { fontSize: 10, bold: true, italics: true, color: 'red' },
                        exporterPdfHeader: { text: "My Header", style: 'headerStyle' },
                        exporterPdfFooter: function (currentPage, pageCount) {
                            return { text: currentPage.toString() + ' of ' + pageCount.toString(), style: 'footerStyle' };
                        },
                        exporterPdfCustomFormatter: function (docDefinition) {
                            docDefinition.styles.headerStyle = { fontSize: 22, bold: true };
                            docDefinition.styles.footerStyle = { fontSize: 10, bold: true };
                            return docDefinition;
                        },
                        exporterPdfOrientation: 'landscape',
                        exporterPdfPageSize: 'LETTER',
                        exporterPdfMaxGridWidth: 500
                    }
                    angular.extend($scope.listpanel.gridOpts, pdfo);

                    if (!$scope.listpanel.gridOpts.gridMenuCustomItems) {
                    	$scope.listpanel.gridOpts.gridMenuCustomItems = [];
                    }
                    angular.forEach($scope.listpanel.gridOpts.gridMenuCustomItems, function (value, key) {
                    	value.action = customFunctions[value.action];
                    	value.shown = customFunctions[value.shown] || function () {
                    		return this.grid.selection.selectedCount;
                    	};
                    	value.order = value.order || 210
                    });

                    $scope.listpanel.gridOpts.gridMenuCustomItems.push(
                      {
                          title: 'Delete selected row(s)',
                          action: function ($event) {
                              var patternRequestData=[];
                              var selectedRows = this.grid.api.selection.getSelectedRows();
                              var paramID = $scope.viewObject.Params[0].name;
                              var deleproc = $scope.viewObject.deletePanel.toString();
                              var procCall = [];
                              var rowid = null;
                              for(var m=0; m < selectedRows.length; m++)
                              {
                                  rowid = selectedRows[m][paramID];
                                  ds[deleproc](rowid).then(function (response)
                                  {
                                          if (response.v_ReturnCode == "0") {
                                              $scope.$parent.$parent.$parent.$parent.dashboardScope.refreshDashboard();
                                          }
                                          return;
                                      });
                              }

                              //TODO now delete them one by one;
                          },
                          shown: function () {
                              return this.grid.selection.selectedCount;
                          },
                          order: 210
                      }
                    );


                    if ($scope.viewObject.pagination && $scope.viewObject.pagination.useExternalPagination) {
                        //External Pagination
                        var externalPagination = {
                            paginationPageSizes: $scope.viewObject.pagination.paginationPageSizes || [25, 50, 75],
                            paginationPageSize: $scope.viewObject.pagination.paginationPageSize || 25,
                            useExternalPagination: true,
                            //useExternalSorting: false,
                            onRegisterApi: function (gridApi) {
                                $scope.gridApi = gridApi;
                                //$scope.gridApi.core.on.sortChanged($scope, function (grid, sortColumns) {
                                //    if (sortColumns.length == 0) {
                                //        paginationOptions.sort = null;
                                //    } else {
                                //        paginationOptions.sort = sortColumns[0].sort.direction;
                                //    }
                                //    getPage();
                                //});
                                gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {

                                    var c = "";
                                    $scope.requestParams = $scope.requestParams || {};
                                    if ($scope.viewObject.pagination.paramPageSize) {
                                        $scope.requestParams[$scope.viewObject.pagination.paramPageSize] = pageSize;
                                    }

                                    if ($scope.viewObject.pagination.paramItemOffset) {
                                        $scope.requestParams[$scope.viewObject.pagination.paramItemOffset] = (newPage - 1) * pageSize;
                                    }

                                    if ($scope.viewObject.pagination.paramPageNumber) {
                                        $scope.requestParams[$scope.viewObject.pagination.paramPageNumber] = newPage;
                                    }

                                    //paginationOptions.pageNumber = newPage;
                                    //paginationOptions.pageSize = pageSize;
                                    $scope.refreshPanel();
                                });
                            }
                        };

                        angular.extend($scope.listpanel.gridOpts, externalPagination);
                    }
                    
                    

                    angular.forEach($scope.listpanel.gridOpts.columnDefs, function (a, b) {
                        if (a.width && a.width.toString().toLowerCase() == "auto") {
                            a.width = a.name.length * 12 || 50;
                        }

                        a.field = a.name;
                        a.displayName = utility.adjustText(a.name);

                        // This if is used for deleting purpose, 
                        // Once a user clicks delete button present in Details Panel, 
                        // It will redirect to this dashboard by using Dashboard link created in this logic.
                        if (a.cellTemplate) {
                            var startIndex = a.cellTemplate.indexOf("html#/");
                            var endIndex = a.cellTemplate.indexOf("?");
                            if (startIndex != -1 && endIndex != -1 && endIndex > startIndex) {
                                SchemaService.addDashboardLink($scope.dashboard.dashboardname, a.cellTemplate.substring(a.cellTemplate.indexOf("html#/") + 6, a.cellTemplate.indexOf("?")));
                            }
                        }
                        else {
                            a.cellTemplate = '<div><input style="background: transparent;border: 0;" type="text" ng-model="row.entity[\'' + a.field + '\']" readonly></div>';
                        }
                        ///////////////////////////////////////////////////////////////

                        if (a.displayName.indexOf('V_') == 0) {
                            a.displayName = a.displayName.replace('V_', '');
                            a.displayName = a.displayName.trim();
                        }

                        listHelperService.addAlignmentClass(a);
                        listHelperService.addHeaderWrap(a);
                        listHelperService.addHeaderAlignmentClass(a);
                        listHelperService.addMaskingAttributes(a);
                    });
                }
                $scope.$on('tabChanged', function (event, data) {
                    if ($scope.dependents.isResolved && $scope.tabindex == data) {
                        $scope.refreshPanel();
                    }
                });
                //$scope.refreshPanel();
                Dependent.dependentRefresh($scope);
                if ($scope.dashboard) {
                    $scope.dashboard.childPanels.push($scope.refreshPanel);
                }
                

            },
            scope: {
                viewObject: "=",    // Priority 1
                viewName: "@",      // Priority 2
                //updateProcName: "@", // Priority 3
                //showasmodal: "@",
                dashboard: "=",
                sourcedata: "=",
                tabindex: "@"
            }
        }

    }])
        .service('listHelperService', ['Utility', 'MaskingService', function (utility, MaskingService) {

            this.addAlignmentClass = function (columnObj) {
                columnObj.cellClass = columnObj.cellClass || '';
                switch (columnObj && columnObj.colTextAlign) {
                    case "left":
                    case "right":
                    case "center":
                    case "justify":
                        columnObj.cellClass += " text-" + columnObj.colTextAlign;
                        break;
                }

                if (columnObj.cellTemplate && columnObj.cellTemplate.indexOf('<input') > -1 && columnObj.cellClass) {
                    columnObj.cellTemplate = columnObj.cellTemplate.replace('<input', '<input class="' + columnObj.cellClass + '"');
                }
            }

            this.addHeaderAlignmentClass = function (columnObj) {
                columnObj.headerCellClass = columnObj.headerCellClass || '';
                switch (columnObj && columnObj.headerTextAlign) {
                    case "left":
                    case "right":
                    case "center":
                    case "justify":
                        columnObj.headerCellClass += " text-" + columnObj.headerTextAlign;
                        break;
                }
            }

            this.addHeaderWrap = function (columnObj) {

                columnObj.headerCellClass = columnObj.headerCellClass || '';
                if (!columnObj.nowrap) {
                    columnObj.headerCellClass += ' wrapGridHeading';
                }
            }

            this.maskData = function (grid) {
                angular.forEach(grid.columnDefs, function (a, b) {
                    angular.forEach(grid.data, function (aData, bData) {

                        var mask = utility.getMask(a);
                        if (mask) {
                            aData[a.name] = MaskingService.maskedOutput(aData[a.name], mask);
                        }
                    });
                });
            }


            this.addMaskingAttributes = function (columnObj) {
                var mask = utility.getMask(columnObj);

                if (mask) {
                    if (columnObj.cellTemplate && columnObj.cellTemplate.indexOf('<input') > -1) {
                        columnObj.cellTemplate = columnObj.cellTemplate.replace('<input', '<input ui-mask="' + mask + '"');
                    }

                }
            }
        }]);
})(window.angular);
    