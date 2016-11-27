var paramsUtility = require('./paramsUtility.js');
function constructor(context) {
	var self = {
		setSchemaObject: function (schemaObject) {
			return context.set(schemaObject, 'schemaObject');
		},
		getSchemaObject: function () {
			return context.get('schemaObject');
		},
		isAuthenticationRequired: function () {
			var s = self.getSchemaObject();
			return !!!s.NoAuthenticationRequired;
		},
		getAPIName: function () {
			var s = self.getSchemaObject();
			return s.APIName;
		},
		getApplicationID: function () {
			var s = self.getSchemaObject();
			return s.ApplicationID;
		},
		getApplicationName: function () {
			var s = self.getSchemaObject();
			return s.ApplicationName;
		},
		getCompletePath: function () {
			var s = self.getSchemaObject();
			return s.CompletePath;
		},
		getHttpMethod: function () {
			var s = self.getSchemaObject();
			return s.HttpMethod;
		},
		getParams: function () {
			var s = self.getSchemaObject();
			return s.Params;
		},
		getPreviousStateAPIName: function () {
			var s = self.getSchemaObject();
			return s.GetPreviousStateAPIName;
		},
		getUndoAPIName: function () {
			var s = self.getSchemaObject();
			return s.UndoAPIName;
		},
		getUndoTranslationMap: function () {
			var s = self.getSchemaObject();
			return s.UndoTranslationMap;
		},
		getPreviousStateTranslationMap: function () {
			var s = self.getSchemaObject();
			return s.GetPrevStateTranslationMap;
		},
		getSetRecordStateAPIName: function () {
			var s = self.getSchemaObject();
			return s.SetRecordStateAPIName;
		},
		getSetRecordStateTranslationMap: function () {
			var s = self.getSchemaObject();
			return s.SetRecordStateTranslationMap;
		},
		getAPIResponseResultParamName: function () {
			var s = self.getSchemaObject();
			return s.APIResponseResultParamName;
		},
		getResponseParamToResultRegex: function () {
			var s = self.getSchemaObject();
			return s.ResponseParamToResultRegex;
			
		},
		getSubjectIDField: function () {
			var s = self.getSchemaObject();
			return s.SubjectIDField || null;
		},
		getGlobalAPIName: function () {
			var s = self.getSchemaObject();
			return s.name;
		},		
		getInParams: function () {
			var inParams = [];
			var params = self.getParams();
			for (var i = 0; i < params.length; i++) {
				if (paramsUtility.getParamDirection(params[i])=="in") {
					inParams.push(params[i]);
				}
			}
			return inParams;
		},
		getOutParams: function () {
			var outParams = [];
			var params = self.getParams();
			for (var i = 0; i < params.length; i++) {
				if (paramsUtility.getParamDirection(params[i]) == "out") {
					outParams.push(params[i]);
				}
			}
			return outParams;
		},
		resolveInput: function (inParams) {
			var params = self.getInParams();
			var resultParams = [];
			for (var i = 0; i < params.length; i++) {
				resultParams.push(null);
				var p = params[i];
				if (paramsUtility.getServerParamProperty(p)) {
					resultParams[i] = paramsUtility.resolveServerParam(p,this);
				}
				else {
					var paramName = paramsUtility.getParamName(p);
					if (inParams[paramName] === null || inParams[paramName] === undefined) {
						resultParams[i] = paramsUtility.getDefaultValue(p);
					}
					else {
						resultParams[i] = inParams[paramName];
					}
				}
			}
			return resultParams;
		},
		getServerParamProperty: function (param) {
			return paramsUtility.getServerParamProperty(param);
		},
		getParamsWithServerProperty: function (params) {
			var result = [];
			for (var i = 0; i < params.length; i++) {
				var p = params[i];
				if (paramsUtility.getServerParamProperty(p)) {
					result.push(p);
				}
			}
			return result;
		},
		resolveOutput: function (result) {
			var params = self.getOutParams();
			var resultParams = [];
			for (var i = 0; i < params.length; i++) {
				var p = params[i];
				if (paramsUtility.getServerParamProperty(p)) {
					paramsUtility.saveInServerParam(p,context);
				}
				else {
					var paramName = paramsUtility.getParamName(p);
					if (inParams[paramName] === null || inParams[paramName] === undefined) {
						resultParams[i] = paramsUtility.getDefaultValue(p);
					}
					else {
						resultParams[i] = inParams[paramName];
					}
				}
			}
			return resultParams;
		},
		getMySQLQuery: function () {
			var methodName = self.getAPIName();
			var params = self.getParams();
			var query = "Call " + methodName + " (";
			var ifOutParam = false;
			var outQuery = "Select ";
			for (var i = 0; i < params.length; i++) {
				var p = params[i];
				if (paramsUtility.getParamDirection(p) === "in") {
					query += "?";//paramsUtility.getParamName(p);
				}
				else {
					ifOutParam = true;
					query += "@" + paramsUtility.getParamName(p);
					outQuery += "@" + paramsUtility.getParamName(p) + ",";
				}

				if (i + 1 < params.length) {
					query += ",";
				} else {
					query += ");";
				}
			}
			outQuery = outQuery.substr(0, outQuery.length - 1) + ";";
			if (!ifOutParam) {
				return query;
			} else {
				return query + " " + outQuery;
			}
		}
	};
	return self;
}




module.exports = constructor;