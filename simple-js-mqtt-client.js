// Simple MQTT client

var MQTTClient = (function () {
	var mqtt = {},
		client = null;

	function privateMethod() {
		// ...
	}

	// mqtt.moduleProperty = 1;
	mqtt.connect = function (host, clientId) {
		client = new Messaging.Client(host, Number(1884), clientId);
	};
	
	mqtt.onMessageArrived = function (message) {
		console.log("onMessageArrived: "+message.payloadString);
	}
	
	mqtt.subscribe = function (channel, callback) {
		mqtt.subscribe(channel);
	};
	
	mqtt.unsubscribe = function (channel) {
		mqtt.unsubscribe(channel);
	};
	
	mqtt.publish = function (channel, message) {
	  message = new Messaging.Message(message);
	  message.destinationName = "obama";
	  client.send(message);
	};
	
	return mqtt;
}());
