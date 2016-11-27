var schema = require('./schema.js');
var utility = require('./utility.js');
var mysql = require('mysql');

var MySql = {
	format: mysql.format,
	getQueryString: function (procName, inParams, outParams) {
		var s = "Call ";
		s += procName + "(";
		var sInParams = "";
		var sOutParams = "";
		if (inParams) {
			for (var i = 0; i < inParams.length; i++) {
				if (typeof inParams[i] == "boolean" || typeof inParams[i] == "number") {
					s += inParams[i] + ",";
				}
				else if (inParams[i] == undefined || inParams[i] == null || inParams[i] == 'undefined' || inParams[i] == 'null') {
					s += "NULL,";
				}

				else { s += "'" + inParams[i] + "',"; }
				
			}
		}
		if (outParams) {
			for (var j = 0; j < outParams.length; j++) {
				sOutParams += "@" + outParams[j] + ",";
			}
			if (sOutParams.length > 0) {
				s += sOutParams;
			}
		}
		if (s[s.length - 1] == ",") {
			s = s.substring(0, s.length - 1);
		}
		s += ");";
		if (sOutParams) {
			if (sOutParams[sOutParams.length - 1] == ",") {
				sOutParams = sOutParams.substring(0, sOutParams.length - 1);
			}
			s += " Select " + sOutParams + ";";
		}
		return s;
	},
	getQuery: function (procName, params) {

		var s = procName.trim();
		if (s.toLowerCase().indexOf('call ') !== 0) {
			s = "Call " + procName;
		}

		var normalized = this.normalize.call(this, procName, params);
		if (normalized) {
			s += "(" + normalized.result + ");";
			if (normalized.outSelect != null || normalized.outSelect.trim().length > 0) {
				s += normalized.outSelect + ";";
			}
		}
		return s;
	},
	normalizedError: function (err) {
		return err;
	},

	normalizedResult: function (data) {
		var result = Object.create(data);
		result.data = {};
		if (data.length > 1) {
			if (Array.isArray(data[0])) {
				result.data.rows = data[0];
			}

			if (data.length > 1) {
				var dataRows = data[2] || data[1]; // This one is to tackle cases if procedure has an out as well as multiple rows output as select.
				for (var row = 0; row < dataRows.length; row++) {
					var aRow = dataRows[row];
					for (var column in aRow) {
						result.data[column.substring(1, column.length)] = aRow[column];
					}
				}
			}

		}
		return result.data;
	},
	outParamsQuery: function (name, args) {
		var _params = schema.getParameters(name);
		var result = "";
		foreach(prop in _params)
		{
			if (prop["direction"] != null && prop["direction"].toLowerCase() != "in") {
				if (result.length > 0) {
					result += ",";
				}
				result += "@" + prop.name;
			}
		}
		return result;
	},
	normalize: function (name, args) {
		var _params = schema.getParameters(name);
		var result = "";
		var outSelect = "";
		for (var i = 0; _params && i < _params.length; i++) {
			var prop = _params[i];

			if (result.length > 0) {
				result += ",";
			}

			if (prop.direction == "in") {
				var _localResult = utility.getObjectValue(args, prop);
				if (_localResult != null) {
					result += "'" + _localResult.toString().replace(/'/g, "\\'") + "'";
				}
				else {
					if (prop["default"] != null) {
						result += "'" + prop["default"] + "'";
					}
					else {
						result += "null";
					}
				}
			}
			else {
				result += "@" + prop.name;

				if (outSelect.length > 0) {
					outSelect += ",";
				}
				else {
					outSelect = "Select ";
				}
				outSelect += "@" + prop.name;
				hasOutParams = true;
			}

		}
		return { result: result, outSelect: outSelect };
	}
}
module.exports = MySql;