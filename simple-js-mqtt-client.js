// Simple MQTT client

var MQTT = (function () {
	var mqtt = {},
		isConnected = false,
		subscriptions = {};

	function privateMethod() {
		// ...
	}

	// mqtt.moduleProperty = 1;
	mqtt.connect = function (host, clientId) {
		// Create client
		client = new Messaging.Client(host, Number(1884), clientId);
		// Register callbacks
		client.onConnectionLost = function(){
			isConnected = false;
			// TODO try to reconnect
		}
		client.onMessageArrived = function (message) {
			console.log("Received " + message.payloadString + " on channel " + message.destinationName);
		}
		// Connect
		client.connect({onSuccess:function(){
			isConnected = true;
			console.debug("Connected to MQTT server")	
		}});
	};
	
	mqtt.disconnect = function() {
		client.disconnect()
		isConnected = false;
		console.debug("Disconnected from MQTT server")
	}
	
	mqtt.isConnected = function() {
		return isConnected
	}
	
	mqtt.subscribe = function (channel, callback) {
		var options = {};
		options.qos = 0;
		options.onSuccess = function() {
			subscriptions[channel] = callback;
			console.debug("Subscribed to channel " + channel);
		}
		client.subscribe(channel, options);
	};
	
	mqtt.unsubscribe = function (channel) {
		var options = {};
		options.onSuccess = function() {
			delete subscriptions[channel];
			console.debug("Unsubscribed from channel " + channel);
		}
		client.unsubscribe(channel, options);
	};
	
	mqtt.getSubscriptions = function() {
		return Object.keys(subscriptions);
	};
	
	mqtt.publish = function (channel, message) {
	  message = new Messaging.Message(message);
	  message.destinationName = channel;
	  client.send(message);
	};
	
	return mqtt;
}());
