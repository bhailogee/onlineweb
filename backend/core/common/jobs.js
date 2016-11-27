/// <reference path= />
/// <reference path= />
var config = require('../appConfig.js');
var platformHandler = require("./PlatformHandler.js");
var schema = require("./schema.js");
var mapp = require("./mapper.js");
var dataservice = require("./dataservice.js");
var CronJob = require('cron').CronJob;

var jobs = {
	init: function () {
		jobs.esbSessionsTimer();
		jobs.purgeHangedSessionsTimer();
	},
	esbSessionsTimer: function () {
		setTimeout(function () {
			dataservice.getesbSessionsData().done(function (r) {
				for (var i = 0; i < r.rows.length; i++) {
					var mappedObject = mapp(firedData, r.rows[i].v_EventDataTranslationMap);
					var apiSchema = schema.getSchemaByAPIID(r.rows[i].v_APIID);
					var apiName = "";
					if (apiSchema && apiSchema.name) {
						apiName = apiSchema.name;
					}
					var platHandler = platformHandler();
					platHandler.execute(
						apiName,
						mappedObject,
						{},
						platformObject
						).done(function (result) {
							delete result.result.resultCode;
							def.resolve(result.result);
						}).fail(function (error) {
							def.reject(error);
						});
				}
			});
		}, config.esbSessionsTimer);
	},
	purgeHangedSessionsTimer: function () {
		setTimeout(function () {
			dataservice.getHangedSessionsData().done(function (r) {

				for (var i = 0; i < r.rows.length; i++) {
					//TODO;
					var job = new CronJob({
						cronTime: r.rows[i].purgeTimer,
						onTick: function () {
							var mappedObject = mapp(firedData, r.rows[i].v_EventDataTranslationMap);
							var apiSchema = schema.getSchemaByAPIID(r.rows[i].v_APIID);
							var apiName = "";
							if (apiSchema && apiSchema.name) {
								apiName = apiSchema.name;
							}
							var platHandler = platformHandler();
							platHandler.execute(
								apiName,
								mappedObject,
								{},
								platformObject
								).done(function (result) {
									delete result.result.resultCode;
									def.resolve(result.result);
								}).fail(function (error) {
									def.reject(error);
								});
						},
						start: true,
						timeZone: 'America/Los_Angeles'
					});
				}
			});
		}, config.esbSessionsTimer);
	}
};
module.exports = jobs;