if( typeof MQTT === 'undefined' ) {
	// node
	var assert = require('chai').assert;
  var MQTT = require('../simple-js-mqtt-client.js');
} else {
	// browser
	var assert = chai.assert;
}

describe('MQTT', function(){
  describe('#test()', function(){
    it('should return "test" when called', function(){
      assert.equal("test", MQTT.test());
    })
  })
})