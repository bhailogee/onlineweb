var WorkflowAPIs = {
	createSubscriber: function (handler) {
		handler.begin();
		handler.executeAPI("TX_AddReceipt", {});
	}
}