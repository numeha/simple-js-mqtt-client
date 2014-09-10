/**********************
 * Simple MQTT client *
 **********************/

(function () {
	"use strict";
	
	var root = this
	var previous_mqtt = root.MQTT

	var has_require = typeof require !== 'undefined'
	
	// Internal reference to mqtt and other variable initialization
	var mqtt = {},
		isConnected = false,
		subscriptions = {};
		
	// Export mqtt object for node.js, with
	// backwards-compatibility for the old `require()` API. If we're in
	// the browser, add `MQTT` as a global object.
	if (typeof exports !== 'undefined') {
		if (typeof module !== 'undefined' && module.exports) {
			exports = module.exports = mqtt;
		}
		exports.MQTT = mqtt;
	} else {
		root.MQTT = mqtt;
	}
 
	// Current version.
	mqtt.VERSION = '0.1.0';
	
	// Run simple-js-mqtt-client in noConflict mode, returning the 
	// MQTT variable to its previous owner. 
	// Returns a reference to the MQTT object.
	mqtt.noConflict = function() {
		root.MQTT = previous_mqtt;
	  return mqtt;
	}
	
	// Test function	
	mqtt.test = function () {
		return "test"
	};	
	
	/**
	 * Connects to a MQTT broker and optionally executes a callback.
	 *
	 * @param {string} host - the hostname of the broker.
	 * @param {string} clientId  - the unique name of this client.
	 * @param {callback} [callback] - A function that is executed after a successful connection.
	 */
	mqtt.connect = function (host, clientId, callback) {
		// Create client
		client = new Messaging.Client(host, Number(1884), clientId);
		// Register callbacks
		client.onConnectionLost = function(){
			isConnected = false;
			// TODO try to reconnect
		}
		client.onMessageArrived = function (message) {
			subscriptions[message.destinationName](message.payloadString)
			console.debug("Message `" + message.payloadString + "` on channel `" + message.destinationName +"`");
		}
		// Connect
		client.connect({onSuccess:function(){
			isConnected = true;
			console.debug("Connected to MQTT server")	
			// If there is a callback defined, execute it
			if (callback!==undefined)
				callback()
		}});
	};
	
	/**
	 * Disconnects from the MQTT client.
	 */
	mqtt.disconnect = function() {
		client.disconnect()
		isConnected = false;
		subscriptions = {};
		console.debug("Disconnected from MQTT server")
	}
	
	/**
	 * Checks if we are still connected to the MQTT broker.
	 * @returns {Boolean} true if connected, false otherwise.
	 */
	mqtt.isConnected = function() {
		return isConnected
	}
	
	/**
	 * Subscribes to a channel and registers a callback.
	 * @param {string} channel  - the channel we are subscribing to.
	 * @param {callback} - A function that is executed every time a message is received on that channel.
	 */
	mqtt.subscribe = function (channel, callback) {
		var options = {};
		options.qos = 0;
		options.onSuccess = function() {
			subscriptions[channel] = callback;
			console.debug("Subscribed to channel " + channel);
		}
		client.subscribe(channel, options);
	};
	
	/**
	 * Unsubscribe from a channel.
	 * @param {string} channel  - the channel we are unsibscribing from.
	 */
	mqtt.unsubscribe = function (channel) {
		var options = {};
		options.onSuccess = function() {
			delete subscriptions[channel];
			console.debug("Unsubscribed from channel " + channel);
		}
		client.unsubscribe(channel, options);
	};
	
	/**
	 * Lists all the channels we are currently subscribed to.
	 * @returns {Array} a lists of all the channels we are currently subscribed to.
	 */
	mqtt.getSubscriptions = function() {
		return Object.keys(subscriptions);
	};
	
	/**
	 * Publishes a message to a channel.
	 * @param {string} channel  - the channel we are publishing to.
	 * @param {string} message - the message we are publishing.
	 */
	mqtt.publish = function (channel, message) {
	  message = new Messaging.Message(message);
	  message.destinationName = channel;
	  client.send(message);
	};
	
	return mqtt;
}.call(this));
