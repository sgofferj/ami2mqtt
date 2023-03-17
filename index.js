const ami = require('asterisk-manager');

var asterisk = new ami('5038','epsilonix.gofferje.net','sgofferj','firefly');

asterisk.keepConnected();

asterisk.on('devicestatechange', function(evt) {
    console.log(evt);
});

