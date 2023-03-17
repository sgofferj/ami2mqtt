# ami2mqtt
An Asterisk Manager event to MQTT bridge

(C) 2023 Stefan Gofferje

Licensed under the GNU General Public License V3 or later.

## Description
ami2mqtt is designed to run in the background, ideally as a container. It connects to an Asterisk PBX server's manager interface, subscribes to certain events and publishes them under corresponding topics on an MQTT server.

## Purpose
I wrote this for integrating my home Asterisk deeper into my home automation system, namely Home Assistant and a bunch of IoT devices. Among other things, I have an solar-powered ESP8266-based Wifi-buzzer in the garden, which buzzes whenever a call comes in on my Asterisk. I also have a nice busy lamp field now in Home Assistant.

## Configuration
The following values are supported and can be provided either as environment variables or through an .env-file.

| Variable | Default | Purpose |
|----------|---------|---------|
| AMI_HOST | asterisk | Asterisk server IP or hostname |
| AMI_PORT | 5038 | Asterisk Manager Interface port |
| AMI_USERNAME | asterisk | User name for Asterisk Manager Interface |
| AMI_PASSWORD | manager | Password for Asterisk Manager Interface |
| MQTT_URL | mqtt | MQTT server URL (can be one the following protocols: 'mqtt', 'mqtts', 'tcp', 'tls', 'ws', 'wss', 'wxs', 'alis') e.g. 'mqtt://server.domain.tld' |
| MQTT_USERNAME | null | MQTT user name
| MQTT_PASSWORD | null | MQTT password |
