// @flow

import AwsMqttClient from 'aws-mqtt-client';

import config from 'app/config';


// Initialise the MQTT client in the browser only
const client = __CLIENT__ && new AwsMqttClient(config.mqtt);

let ready = false;
const queued = [];

// Connect only in the browser
__CLIENT__ && client && client.on('connect', () => {
  ready = true;
  let call;
  // eslint-disable-next-line no-cond-assign
  while ((call = queued.pop())) {
    const [methodName, ...args] = call;
    client[methodName](...args);
  }
});

// Ideally a Proxy would be better here, but Proxies are not widely supported among browsers yet
export default ['subscribe', 'publish', 'on', 'end'].reduce((acc, methodName) => {
  acc[methodName] = (...args: any[]) => {
    // If we aren't in the browser, just no-op
    if (!__CLIENT__) return;

    if (ready) {
      // $FlowFixMe
      client[methodName](...args);
    } else {
      queued.push([methodName, ...args]);
    }
  };
  return acc;
}, {});
