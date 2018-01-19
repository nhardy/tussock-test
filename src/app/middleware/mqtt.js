// @flow

import client from 'app/lib/mqtt';
import { MQTT_TOPIC_SUBSCRIBE, MQTT_MESSAGE_OUTGOING } from 'app/actions/mqtt';
import type { ReduxAction } from 'app/flowTypes';


export default function mqttMiddleware() {
  return (next: (ReduxAction) => void) => (action: ReduxAction): void => {
    switch (action.type) {
      case MQTT_MESSAGE_OUTGOING: {
        const { topic, message } = action;
        client.publish(topic, message);
        break;
      }

      case MQTT_TOPIC_SUBSCRIBE: {
        const { topic } = action;
        client.subscribe(topic);
        break;
      }

      default:
        // Do nothing
    }

    next(action);
  };
}
