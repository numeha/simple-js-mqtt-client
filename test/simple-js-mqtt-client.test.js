if( typeof chai === 'undefined' ) {
	// node
	var assert = require('chai').assert;
  var MQTT = require('../simple-js-mqtt-client.js');
} else {
	// browser
	var assert = chai.assert;
}

describe('MQTT', function(){
	
	it('should connect, verify connection, subscribe, list current subscriptions, receive a message', function(){
		// Connect and register callback for when connection happens
		MQTT.connect("ltg.evl.uic.edu", function() {
			// Check if the client is connected (it shuold be since we are inside the callback that 
			// is fired whenever the connection is established)
			assert.equal(true, MQTT.isConnected())
			// Suscribe to a bunch of channels and register a callback to handle received message
			MQTT.subscribe('demo1', function(message) {
				assert.equal('test-message-1', message);
				// Disconnect
				MQTT.disconnect()
				assert.equal(false, MQTT.isConnected())
			}, function() {
				// Once the first subscrition is complete, we can proceed with the second one
				MQTT.subscribe('channel_2', function(message) {}, function() {
					MQTT.subscribe('channel_3', function(message) {}, function() {
						assert.equal(2, MQTT.getSubscriptions().indexOf('channel_3'));
						MQTT.unsubscribe('channel_3', function(){
							assert.equal(-1, MQTT.getSubscriptions().indexOf('channel_3'));
							// Only when we tested un-subscription we're gonna send the message
							MQTT.publish('demo1', 'test-message-1')
						}); // Unsubscribe
					}); // Third subscribe
				}); // Second subscribe
			}); // First subscribe
		}); // Connect
  });
})
