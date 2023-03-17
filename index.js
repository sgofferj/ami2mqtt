require('dotenv').config()

const ami = require('asterisk-manager');
const mqtt = require('mqtt')

const amiPort = (typeof process.env.AMI_PORT !== 'undefined') ? process.env.AMI_PORT : '5038';
const amiHost = (typeof process.env.AMI_HOST !== 'undefined') ? process.env.AMI_HOST : 'asterisk';
const amiUser = (typeof process.env.AMI_USERNAME !== 'undefined') ? process.env.AMI_USERNAME : 'asterisk';
const amiPass = (typeof process.env.AMI_PASSWORD !== 'undefined') ? process.env.AMI_PASSWORD : 'manager';
const mqttURL = (typeof process.env.MQTT_URL !== 'undefined') ? process.env.MQTT_URL : 'mqtt';
const mqttUser = (typeof process.env.MQTT_USERNAME !== 'undefined') ? process.env.MQTT_USERNAME : null;
const mqttPass = (typeof process.env.MQTT_PASSWORD !== 'undefined') ? process.env.MQTT_PASSWORD : null;

const asterisk = new ami(amiPort,amiHost,amiUser,amiPass,true);
const mqtt_client = new mqtt.connect(mqttURL,{'username':mqttUser,'password':mqttPass})

asterisk.keepConnected();

asterisk.on('successfulauth', function(evt) {
    asterisk.action({
        "Action":"DeviceStateList",
        "ActionID":"getState"
    })
});

asterisk.on('devicestatechange', function(evt) {
    console.log(evt);
    let dev = evt.device.toLowerCase();
    let tDev = dev.replace(/:/g,'/');
    let topic = 'pbx/devstate/'+tDev;
    console.log(topic+" "+evt.state);
    mqtt_client.publish(topic,evt.state);
});

