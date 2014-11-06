if( typeof chai === 'undefined' ) {
	// node
	var assert = require('chai').assert;
  var MQTT = require('../simple-js-mqtt-client.js');
} else {
	// browser
	var assert = chai.assert;
}

describe('MQTT', function(){
  
	describe('#connect()', function(){
    
		it('should connect and verify connection', function(){
			// Connect and register callback for when connection happens
			MQTT.connect("ltg.evl.uic.edu", function() {
				// Check if the client is connected (it shuold be since we are inside the callback that 
				// is fired whenever the connection is established)
				assert.equal(true, MQTT.isConnected())
				// Disconnect
				MQTT.disconnect()
				assert.equal(false, MQTT.isConnected())
			});
    });
		
		it('should connect, subscribe and receive a message', function(){
			// Connect and register callback for when connection happens
			MQTT.connect("ltg.evl.uic.edu", function() {
				// Suscribe to a channel and register a callback to handle received messages
				MQTT.subscribe('demo1', function(message) {
					assert.equal('test-message-1', message);
					MQTT.unsubscribe('demo1');
					MQTT.disconnect();
				});		
				// Send the message that should be received
				MQTT.publish('demo1', 'test-message-1')
			});
    });
		
  });
	
	describe('#subscribe()', function(){

		it('should list current subscriptions correctly', function(){
			// Connect and register callback for when connection happens
			MQTT.connect("ltg.evl.uic.edu", function() {
				// Subscribe to a bunch of channels
		    MQTT.subscribe('channel_1', function(message) {})
		    MQTT.subscribe('channel_2', function(message) {})
		    MQTT.subscribe('channel_3', function(message) {})
		    assert.equal(2, MQTT.getSubscriptions.indexOf('channel_3'))
		    MQTT.unsubscribe('channel_3') 
		    assert.equal(-1, MQTT.getSubscriptions.indexOf('channel_3'))
			MQTT.disconnect()
			});
    });

	});
})
