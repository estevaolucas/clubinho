cordova.define("beaconCtrl.beaconCtrl", function(require, exports, module) { var exec = require('cordova/exec'),
  cordova = require('cordova');

function BeaconCtrl() {};

BeaconCtrl.prototype.startMonitoring = function(config, successCallback, errorCallback) {
  exec(successCallback,
      errorCallback, 
      'BeaconCtrlCordovaPlugin', 
      'startMonitoring', 
      [config]
      );
};

BeaconCtrl.prototype.stopMonitoring = function(successCallback, errorCallback) {
  exec(successCallback,
      errorCallback, 
      'BeaconCtrlCordovaPlugin', 
      'stopMonitoring', 
      []
      );
};

BeaconCtrl.prototype.start = function(config) {
  var config = config || {};

  this.startMonitoring(config, function(result) {
    if (result.type) {
      cordova.fireDocumentEvent(result.type, result.data || {});
    }
  }, function (e) {
    console.log('Error initializing BeaconControl: ' + e);

    // cordova.fireDocumentEvent('error', e);
    var error = JSON.stringify(e),
      userInfo = error.info,
      keys = Object.keys(userInfo);
      values = Object.values(userInfo),
      newError = new Array(keys.length);

    for(var i = 0; i < newError.length; i++) {
      newError.push({
        code: keys[i],
        message: values[i]
      });
    }

    console.log('teste', newError);
    cordova.fireDocumentEvent('error', newError);
  });
}

var plugin = new BeaconCtrl();

exports.start = function(config) {
  plugin.start(config);
}

exports.stop = function() {
  plugin.stopMonitoring();
}

});
