/// <reference path= />
var deferred = require("jquery-deferred");
var PlatformHandler = require('../core/common/PlatformHandler.js');
var dataservice = "../core/common/dataservice.js";
var schema = require("../core/common/schema.js");
var mapp = require('../core/common/mapper.js');
var dot = require('dot');
var fs = require('fs');
var internal = {
	iteratorRunner: function (apiName, payLoad, helper, outObject, def, platformObject) {
		var _def = def || deferred.Deferred();
		var _outObject = outObject || [];
		if (payLoad.length > 0) {
			var iteratorPayLoad = payLoad[0];
			console.log("[debug] Iterator Runner row execution starts");
			helper.execute(apiName, iteratorPayLoad, {}, platformObject).done(function (result) {
				if (result.result.resultCode == "Success") {
					console.log("[debug] Iterator Runner row execution success");
					payLoad.shift();
					_outObject.push(result.result);
					return internal.iteratorRunner(apiName, payLoad, helper, _outObject, _def);
				}
				else {
					console.error("[debug] Iterator Runner row execution fail");
					return _def.reject(result.result);
				}
			}).fail(function (err) {
				console.error("[debug] Iterator Runner row execution fail");
				return _def.reject(err);
			});
			
		} else {
			debugger;
			_outObject.resultCode = "Success";
			//_def.resolve(_outObject);
			_def.resolve({ resultCode: "Success" });
		}
		return _def;
	},
	iteratorpageRunner: function (inObject2, platformObject, inObjects, helper, _outObject, _def) {
		var def = _def || deferred.Deferred();
		var outObject = _outObject || [];

		if (inObjects.length > 0) {
			inObject2.payLoad = inObjects[0];
			inObjects.shift();
			console.log("[debug] Iterator page Runner, page loaded");
			WorkflowAPIs.iterator(inObject2, outObject, platformObject).done(function (results) {
				debugger;
				if (results.resultCode == "Success") {
					console.log("[debug] Iterator page Runner row execution success");
					outObject.push(results);
					internal.iteratorpageRunner(inObject2, platformObject, inObjects, helper, outObject, def);
				}
				else {
					if (inObject2.continueOnError) {
						outObject.push(new Error(err));
						internal.iteratorpageRunner(inObject2, platformObject, inObjects, helper, outObject, def);
					}
					else {
						def.reject(err);
					}
				}
			}).fail(function (err) {
				if (inObject2.continueOnError) {
					outObject.push(new Error(err));
					internal.iteratorpageRunner(inObject2, platformObject, inObjects, helper, outObject, def);
				}
				else {
					def.reject(err);
				}
			});
		} else {
			debugger;
			outObject.resultCode = "Success";
			def.resolve(outObject);
		}
		return def;
	},
	resolveTemplate: function (template, data) {
		var templateFunction = dot.template(template);
		var result = templateFunction(data);
		return result;
	},
	fileWrite: function (filePath, data) {
		var def = deferred.Deferred();

		fs.writeFile(filePath, data, function (err) {
			if (err) {
				def.reject(err);
			}
			else {
				def.resolve();
			}
		});
		return def.promise();
	},
	fileRead: function (path) {
		var def = deferred.Deferred();

		fs.readFile(filePath, function (err, data) {
			if (err) {
				def.reject(err);
			}
			else {
				def.resolve(data);
			}
		});
		return def.promise();
	}
};
var WorkflowAPIs = {
	CreateSubscriber: function (inObject, outObject, platformObject) {
        debugger;
		var _def = deferred.Deferred();
		var helper = new PlatformHandler();
        console.log("--------------inObject--------------");
        console.log("inObject:" + JSON.stringify(inObject));
        console.log("----------------------------");
        var userName = inObject["v_UserName"];
        console.log("--------------userName--------------");
        console.log("userName:" + userName);
        console.log("----------------------------");
        var password = inObject["v_Password"];
        console.log("--------------password--------------");
        console.log("password:" + password);
        console.log("----------------------------");
        var Email = inObject["v_Email"];
        console.log("--------------Email--------------");
        console.log("Email:" + Email);
        console.log("----------------------------");
        var CustomerName = inObject["v_CustomerName"];
        var Address = inObject["v_Address"];
        var City = inObject["v_City"];
        var State = inObject["v_State"];
        var Country = inObject["v_Country"];
        var Tel = inObject["v_Tel"];
        var MobileNumber = inObject["v_MobileNumber"];
        var Fax = inObject["v_Fax"];
        var PostalCode = inObject["v_PostalCode"];
        var Company = inObject["v_Company"];
        var Amount = inObject["v_Amount"];
        var InstrumentNumber = inObject["v_InstrumentNumber"];
        var Remarks = inObject["v_Remarks"];
        var PaymentModeID = inObject["v_PaymentModeID"];
        console.log("--------------PaymentModeID--------------");
        console.log("PaymentModeID:" + PaymentModeID);
        console.log("----------------------------");
        var PlanID = inObject["v_PlanID"];
        console.log("--------------PlanID--------------");
        console.log("PlanID:" + PlanID);
        console.log("----------------------------");
        var accountID;
        var ABMFID;
        var planObj = {};
        var contactInfoObj = {};
        var accNoUserNameObj = {};
        var accNoBillingPasswordObj = {};
        var receiptObj = {};
		helper.execute("TX_CreateCustomer", {}, outObject, platformObject).done(function (result) {

            console.log("--------------outObject--------------");
            console.log("outObject:" + JSON.stringify(outObject));
            console.log("----------------------------");

            console.log("---------------result.result------------------");
            console.log(result.result);
            console.log("---------------------------------");

            accountID = result.result.v_AccountID;
            console.log("--------------accountID--------------");
            console.log("accountID:" + result.result.v_AccountID);
            console.log("----------------------------");

            ABMFID = result.result.v_ABMFID;
            console.log("--------------ABMFID--------------");
            console.log("ABMFID:" + result.result.v_ABMFID);
            console.log("----------------------------");


            planObj = {
                v_AccountID: accountID,
                v_PlanID: PlanID,
            	v_SubscriptionID: 0
            };
            receiptObj = {
                v_ABMFID: ABMFID,
                v_Amount: Amount,
                v_InstrumentNumber: InstrumentNumber,
                v_PaymentModeID: PaymentModeID,
                v_Remarks: Remarks
            };

			helper.execute("TX_AssignPlanToAccNo", planObj, outObject, platformObject).done(function (result2) {
                //outObject.push(result2.result);
                console.log("--------------outObject2--------------");
                console.log("outObject2:" + result2.result);
                console.log("----------------------------");
                contactInfoObj = {
                    v_AccountID: accountID,
                    v_Email: Email,
                    v_CustomerName: CustomerName,
                    v_Address: Address,
                    v_City: City,
                    v_State: State,
                    v_Country: Country,
                    v_Tel: Tel,
                    v_MobileNumber: MobileNumber,
                    v_Fax: Fax,
                    v_PostalCode: PostalCode,
                    v_Company: Company
                };
                helper.execute("TX_UpdateAccNoContactInfo", contactInfoObj, outObject, platformObject).done(function (result3) {
                    //outObject.push(result3.result);
                    console.log("--------------outObject3--------------");
                    console.log("outObject3:" + result3.result);
                    console.log("----------------------------");
                    accNoUserNameObj = {
                        v_AccountID: accountID,
                        v_UserName: userName
                    };
                    helper.execute("TX_UpdateAccNoUserName", accNoUserNameObj, outObject, platformObject).done(function (result4) {
                  //      outObject.push(result4.result);
                        console.log("--------------outObject4--------------");
                        console.log("outObject4:" + result4.result);
                        console.log("----------------------------");
                        accNoBillingPasswordObj = {
                            v_AccountID: accountID,
                            v_BillingPassword: password
                        };
                        helper.execute("TX_UpdateAccNoBillingPassword", accNoBillingPasswordObj, outObject, platformObject).done(function (result5) {
                  //          outObject.push(result5.result);
                            console.log("--------------outObject5--------------");
                            console.log("outObject5:" + result5.result);
                            console.log("----------------------------");

                            helper.execute("TX_AddReceipt", receiptObj, outObject, platformObject).done(function (result6) {
                                //outObject.push(result6.result);
                                console.log("--------------outObject6--------------");
                                console.log("outObject6:" + result6.result);
                                console.log("----------------------------");
                            }).fail(function (err6) {
                                _def.reject(err6);
                            });
                        }).fail(function (err5) {
                            _def.reject(err5);
                        });
                    }).fail(function (err4) {
                        _def.reject(err4);
                    });
                }).fail(function (err3) {
                    _def.reject(err3);
                });
			}).fail(function (err2) {
				_def.reject(err2);
			});
		}).fail(function (err) {
			_def.resolve(err);
		});
		return _def.promise();

	},

	iterator: function (inObject, outObject, platformObject) {
		debugger;
		console.log("[debug] iterator called");
		if (inObject["rowsPerTransaction"]) {
			return WorkflowAPIs.iteratorpage(inObject, outObject, platformObject);
		}
		else {
			var _def = deferred.Deferred();
			var helper = new PlatformHandler();
			var apiName = inObject["apiName"];
			var finalResult = {};
			console.log("[debug] Begin Transaction called");
			helper.execute("__Begin", {}, outObject, platformObject, inObject).done(function (resultStart) {
				console.log("[debug] Iterator Execution Rows Called");
				internal.iteratorRunner(apiName, inObject["payLoad"], helper).done(function (result) {
					finalResult = result;
					console.log("[debug] Final Iterator Execution resulted: " + result.resultCode);
					if (result.resultCode == "Success") {
						console.log("[debug] Final Iterator Execution Commit" + result.resultCode);
						helper.execute("__Commit", {}, {}).done(function (commitResult) {
							debugger;
							_def.resolve(result);
						});
					}
					else {
						console.error("[debug] Final Iterator Execution Rollback");
						helper.execute("__Rollback", {}, {}).done(function (commitResult) {
							_def.reject(result);
						});
					}
				}).fail(function (err) {
					console.error("[debug] Final Iterator Execution Rollback" + err);
					helper.execute("__Rollback", {}, {}).done(function (commitResult) {
						_def.reject(finalResult);
					});
				});
			});

			return _def;
		}
	},
	iteratorpage: function (inObject, outObject, platformObject) {
		var inObject2 = JSON.parse(JSON.stringify(inObject));
		var helper = new PlatformHandler();
		var rowsPerTransaction = inObject2.rowsPerTransaction;
		//var continueOnError = inObject2.continueOnError;
		delete inObject2.rowsPerTransaction;
		var inObjects = [];
		for (var page = 0; page < inObject.payLoad.length / rowsPerTransaction; page++) {
			var tmpInObjects = [];
			for (var i = 0; i < rowsPerTransaction && (((rowsPerTransaction * page) + i) < inObject.payLoad.length) ; i++) {
				tmpInObjects.push(inObject["payLoad"][(rowsPerTransaction * page) + i]);
			}
			inObjects.push(tmpInObjects);
		}
		delete inObject2.payload;
		return internal.iteratorpageRunner(inObject2, platformObject, inObjects,helper);
	},
	esb: function (inObject, outObject, platformObject) {
		var eventID = inObject["v_EventTypeID"];
		var firedData = inObject["v_FiredEventData"];

		dataservice.getESBData(eventID).done(function (r) {
			debugger;
			for (var i = 0; i < r.rows.length; i++) {
				var mappedObject = mapp(firedData, r.rows[i].v_EventDataTranslationMap);
				var apiSchema = schema.getSchemaByAPIID(r.rows[i].v_APIID);
				var apiName = "";
				if (apiSchema && apiSchema.name) {
					apiName = apiSchema.name;
				}
				var platHandler = PlatformHandler();
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
	},
	datatofile: function (inObject, outObject, platformObject) {
		var fileName = inObject["v_FileName"];
		var template = inObject["v_Template"];
		var data = inObject["v_Data"];
		var result = internal.resolveTemplate(template, data);
		return internal.fileWrite(fileName, result);
	},
	uploadFile: function (inObject, outObject, platformObject) {
		var fileName = inObject["v_FileName"];
		var data = inObject["v_Data"];
		return internal.fileWrite(fileName, data);
	},
	workflowName: function (inObject, outObject, platformObject) {
		var _def = deferred.Deferred();
		var apiName = "TX_AddAgent";
		var apiPayLoadObject = {};
		var platform = PlatformHandler.resolve(platformObject, apiName);
		var processor = require("../core/processors/processors.js");
		processor.process(apiPayLoadObject, outObject, platform).done(function (result) {
			if (result.result.v_ReturnCode == 0) {
				outObject.asdfasdf = result.result;
				_def.resolve(outObject);
			}
			else {
				return _def.reject(result.result.v_ReturnCode);
			}
		}).fail(function (err) {
			return _def.resolve(err);
		});
		return _def.promise();
	}
}

function workflow(inObject, outObject, platformObject) {
	


}
var cons = {
	init: function () {

		orcestrator.postprocess = postprocess;
		return orcestrator;
	}
};

module.exports = WorkflowAPIs;