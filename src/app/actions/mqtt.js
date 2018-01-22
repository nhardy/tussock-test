// @flow

export const MQTT_REGISTER_HANDLE = 'MQTT_REGISTER_HANDLE';
export const MQTT_TOPIC_SUBSCRIBE = 'MQTT_TOPIC_SUBSCRIBE';
export const MQTT_MESSAGE_RECEIVED = 'MQTT_MESSAGE_RECEIVED';
export const MQTT_MESSAGE_OUTGOING = 'MQTT_MESSAGE_OUTGOING';

export function registerHandle(handle: string) {
  return {
    type: MQTT_REGISTER_HANDLE,
    handle,
  };
}

export function subscribe(topic: string) {
  return {
    type: MQTT_TOPIC_SUBSCRIBE,
    topic,
  };
}

export function messageReceived(topic: string, message: string) {
  return {
    type: MQTT_MESSAGE_RECEIVED,
    topic,
    message,
  };
}

export function messageOutgoing(topic: string, message: string) {
  return {
    type: MQTT_MESSAGE_OUTGOING,
    topic,
    message,
  };
}
