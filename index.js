require('dotenv').config();

const ami = require('asterisk-manager');
const mqtt = require('mqtt')

const amiPort = (typeof process.env.AMI_PORT !== 'undefined') ? process.env.AMI_PORT : '5038';
const amiHost = (typeof process.env.AMI_HOST !== 'undefined') ? process.env.AMI_HOST : 'asterisk';
const amiUser = (typeof process.env.AMI_USERNAME !== 'undefined') ? process.env.AMI_USERNAME : 'asterisk';
const amiPass = (typeof process.env.AMI_PASSWORD !== 'undefined') ? process.env.AMI_PASSWORD : 'manager';
const mqttURL = (typeof process.env.MQTT_URL !== 'undefined') ? process.env.MQTT_URL : 'mqtt://mqtt-server.local';
const mqttUser = (typeof process.env.MQTT_USERNAME !== 'undefined') ? process.env.MQTT_USERNAME : null;
const mqttPass = (typeof process.env.MQTT_PASSWORD !== 'undefined') ? process.env.MQTT_PASSWORD : null;

const asterisk = new ami(amiPort, amiHost, amiUser, amiPass, true);
const mqtt_client = new mqtt.connect(mqttURL, { 'username': mqttUser, 'password': mqttPass })

function createDiscoveryTopic(type,object_id) {
    let discoveryTopic = "homeassistant/" + type + "/" + object_id + "/config";
    return discoveryTopic;
};

function createConfig(topic, name, device, object_id) {
    let config = {
        "device": {
            "identifiers": [object_id],
            "manufacturer": "Asterisk",
            "model": "Device",
            "name": "asterisk-"+name
        },
        "name": "asterisk-"+name,
        "payload_off": "NOT_INUSE",
        "payload_on": "INUSE",
        "state_topic": "pbx/" + topic + "/" + device,
        "unique_id": object_id
    };
    return config;
};

asterisk.keepConnected();

asterisk.on('fullybooted', function (evt) {
    asterisk.action({
        "Action": "DeviceStateList",
        "ActionID": "getState"
    })
    asterisk.action({
        "Action": "ExtensionStateList",
        "ActionID": "getExtensions"
    })
});

mqtt_client.on('connect', function () {
    mqtt_client.subscribe('pbx/devstate/Custom/+/set')
});

asterisk.on('devicestatechange', function (evt) {
    console.log(JSON.stringify(evt));
    let dev = evt.device;
    let tDev = dev.replace(/:/g, '/');
    let uDev = dev.replace(/(:|@)/g, '-');
    let uID = "asterisk-devstate-" + uDev;
    let topic = 'pbx/devstate/' + tDev;
    let discoveryTopic
    let config = JSON.stringify(createConfig("devstate", uDev, tDev, uID));
    if (tDev.substring(0,6) == "Custom") {
        discoveryTopic = createDiscoveryTopic("switch",uID); 
    } else {
        discoveryTopic = createDiscoveryTopic("sensor",uID); 
    }
    mqtt_client.publish(discoveryTopic,config);
    mqtt_client.publish(topic, evt.state);
});

asterisk.on('extensionstatus', function (evt) {
    console.log(JSON.stringify(evt));
    let ext = evt.exten;
    let cont = evt.context;
    let topic = 'pbx/exten/' + cont + '/' + ext;
    mqtt_client.publish(topic, evt.status);
});

asterisk.on('managerevent', function (evt) {
    console.log(JSON.stringify(evt));
});

mqtt_client.on('message', function (topic, message) {
    newState = message.toString();
    let top = topic.split("/");
    if ((top[2] == "Custom") && (top[4] == "set")) {
        console.log(topic);
        asterisk.action({
            "Action": "SetVar",
            "ActionID": "SetDevState",
            "Variable":"DEVICE_STATE(Custom:"+top[3]+")",
            "Value":newState
        })
    }
});