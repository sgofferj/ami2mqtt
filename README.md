[![Build and publish the container image](https://github.com/sgofferj/ami2mqtt/actions/workflows/actions.yml/badge.svg?branch=master)](https://github.com/sgofferj/ami2mqtt/actions/workflows/actions.yml)

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

## MQTT topics
Currently, everything is published under the topic `pbx/#`. I might make this configurable later.
### DeviceStateChange
DeviceStateChange events are published as `pbx/devstate/<device>`. Colons are replaced with slashes.
Examples:
* SIP/1234 -> `pbx/devstate/SIP/1234`
* Custom:Night -> `pbx/devstate/Custom/Night`
* MWI:1000@default -> `pbx/devstate/MWI/1000@default`
### ExtensionStatus
ExtensionStatus events are published as `pbx/exten/<context>/<extension>`.
* 1234 in context internal -> `pbx/exten/internal/1234`
### Set DeviceState
The state of Custom devstates can be set with `pbx/devstate/Custom/<device>/set`
* Custom:Night -> `pbx/devstate/Custom/Night/set`

## Home Assistant autodiscovery
For devstate objects [Home Assistant MQTT autodiscovery topics](https://www.home-assistant.io/integrations/mqtt/#mqtt-discovery) are created. Custom devstates are registered as switches and can be switched from Home Assistant between INUSE and NOT_INUSE. All others are registered as sensors.

## Container use
### Image
The image is built for AMD64 and ARM64 and pushed to ghcr.io: *ghcr.io/sgofferj/ami2mqtt:latest*
### Docker
First, rename .env.example to .env and edit according to your needs \
Create and start the container:
```
docker run -d --env-file .env --name ami2mqtt --restart always ghcr.io/sgofferj/ami2mqtt:latest
```

### Docker compose
Here is an example for a docker-compose.yml file:
```
version: '2.0'

services:
  ami2mqtt:
    image: ghcr.io/sgofferj/ami2mqtt:latest
    restart: always
    networks:
      - default
    environment:
      - AMI_HOST=asterisk
      - AMI_PORT=5038
      - AMI_USERNAME=asterisk
      - AMI_PASSWORD=manager
      - MQTT_URL=mqtt://mqtt-server.local
      - MQTT_USERNAME=mqtt
      - MQTT_PASSWORD=mqtt

networks:
  default:
```