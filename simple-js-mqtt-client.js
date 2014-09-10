/**********************
 * Simple MQTT client *
 **********************/

(function () {
	"use strict";
	
	// Establish the root object, `window` in the browser, or `exports` on the server.
	var root = this
	
	// Save the previous value of the `MQTT` variable to use with noConflict().
	var previous_mqtt = root.MQTT

	// Load dependencies (mqtt libraries)
	// adamvr/MQTT.js for node (https://github.com/adamvr/MQTT.js)
	// Paho.js, via mqtt-ws, for the browser (https://github.com/M2MConnections/mqtt-ws)
	var has_require = typeof require !== 'undefined'
	if( has_require ) {
		// node
		var adamvr_mqtt = root.adamvr_mqtt
		if( typeof adamvr_mqtt === 'undefined' ) {
			adamvr_mqtt = require('mqtt')
		}
	} else {
		// browser
		var mqttws = root.Messaging
		if( typeof mqttws === 'undefined' ) {
			throw new Error('MQTT requires mqtt-ws (https://github.com/M2MConnections/mqtt-ws) a wrapper of Paho.js');
		}
	}	
	
	// Internal reference to mqtt (used below) and other variable initialization
	var mqtt = {},
		br_client = {}, // Browser client
		n_client = {},	// Node client
		isConnected = false,
		subscriptions = {};
		
	// Exports mqtt object for node.js, with
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
 
 
	/* 
	 * Exposes the current version of the library.
	 */
	mqtt.VERSION = '0.2.0';
	
	
	/** 
	 * Runs simple-js-mqtt-client in noConflict mode by  
	 * returning the MQTT variable to its previous owner. 
	 * @return  a reference to the MQTT object defined by this library.
	 */
	mqtt.noConflict = function() {
		root.MQTT = previous_mqtt;
	  return mqtt;
	}
	
	
	/**
	 * Connects to a MQTT broker and optionally executes a callback.
	 *
	 * @param {string} host - the hostname of the broker.
	 * @param {string} clientId  - the unique name of this client.
	 * @param {callback} [callback] - A function that is executed after a successful connection.
	 */
	mqtt.connect = function (host, clientId, callback) {
		if( has_require ) {
			connectNode(host, clientId, callback);
		} else {
			connectBrowser(host, clientId, callback);
		}
	};
	
	// Helper function that connects MQTT client in node
	var connectNode = function(host, clientId, callback) {
		// Create client
		n_client = adamvr_mqtt.createClient(1883, host, {clientId : clientId});
		// Register incoming message callback
		n_client.on('message', function(channel, message) {
			// Executes the appropriate channel callback
			subscriptions[channel](message);
		});
		// Register successfull connection callback
		n_client.on('connect', function(){
			// Set isConnected flag and output message
			isConnected = true;
			// If the user defined a callback, execute it
			if (callback!==undefined) {
				callback();
			}
		});
	};
	
	// Helper function that connects MQTT client in the browser
	var connectBrowser = function(host, clientId, callback) {
		// Create client
		br_client = new Messaging.Client(host, Number(1884), clientId);
		// Register callbacks
		br_client.onConnectionLost = function(){
			isConnected = false;
			// TODO try to reconnect
		}
		br_client.onMessageArrived = function (message) {
			subscriptions[message.destinationName](message.payloadString)
			console.debug("Message `" + message.payloadString + "` on channel `" + message.destinationName +"`");
		}
		// Connect
		br_client.connect({onSuccess:function(){
			isConnected = true;
			console.debug("Connected to MQTT server")	
			// If there is a callback defined, execute it
			if (callback!==undefined) {
				callback();
			}
		}});
	};
	
	
	/**
	 * Disconnects from the MQTT client.
	 */
	mqtt.disconnect = function() {
		if( has_require ) {
			disconnectNode();
		} else {
			disconnectBrowser();
		}
	}
	
	// Helper function that disconnects MQTT client in node
	var disconnectNode = function(){
		n_client.end();
		isConnected = false;
		subscriptions = {};
	};
	
	// Helper function that diconnects MQTT client in the browser
	var disconnectBrowser = function(){
		br_client.disconnect()
		isConnected = false;
		subscriptions = {};
		console.debug("Disconnected from MQTT server");
	};
	
	
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
		if( has_require ) {
			subscribeNode(channel, callback);
		} else {
			subscribeBrowser(channel, callback);
		}
	};
	
	// Helper function that subscribes to a channel in node
	var subscribeNode = function(channel, callback){
		var onSuccess = function(err, granted) {
			subscriptions[channel] = callback;
		}
		n_client.subscribe(channel, {qos : 0}, onSuccess);
	};
	
	// Helper function that subscribes to a channel in the browser
	var subscribeBrowser = function(channel, callback){
		var options = {};
		options.qos = 0;
		options.onSuccess = function() {
			subscriptions[channel] = callback;
			console.debug("Subscribed to channel " + channel);
		}
		br_client.subscribe(channel, options);
	};
	
	
	/**
	 * Unsubscribe from a channel.
	 * @param {string} channel  - the channel we are unsibscribing from.
	 */
	mqtt.unsubscribe = function (channel) {
		if( has_require ) {
			unsubscribeNode(channel);
		} else {
			unsubscribeBrowser(channel);
		}
	};
	
	// Helper function that unsubscribes from a channel in node
	var unsubscribeNode = function(channel) {
		var onSuccess = function() {
			delete subscriptions[channel];
		}
		n_client.unsubscribe(channel, onSuccess);
	};
	
	// Helper function that subscribes from a channel in the browser
	var unsubscribeBrowser = function(channel) {
		var options = {};
		options.onSuccess = function() {
			delete subscriptions[channel];
			console.debug("Unsubscribed from channel " + channel);
		}
		br_client.unsubscribe(channel, options);
	};
	
	
	/**
	 * Lists all the channels we are currently subscribed to.
	 * @returns {Array} a lists of all the channels we are currently subscribed to.
	 */
	mqtt.getSubscriptions = function() {
		return Object.keys(subscriptions)
	};
	
	
	/**
	 * Publishes a message to a channel.
	 * @param {string} channel  - the channel we are publishing to.
	 * @param {string} message - the message we are publishing.
	 */
	mqtt.publish = function (channel, message) {
		if( has_require ) {
			publishNode(channel, message)
		} else {
			publishBrowser(channel, message)
		}
	};
	
	// Helper function that publishes to a channel in node
	var publishNode = function (channel, message) {
		n_client.publish(channel, message)
	};
	
	// Helper function that publishes to a channel in the browser
	var publishBrowser = function (channel, message) {
	  message = new Messaging.Message(message);
	  message.destinationName = channel;
	  br_client.send(message);
	};
	
	
	// AMD registration happens at the end for compatibility with AMD loaders
	// that may not enforce next-turn semantics on modules.
	if (typeof define === 'function' && define.amd) {
		define('MQTT', [], function() {
			return mqtt;
		});
	}
	
}.call(this));
