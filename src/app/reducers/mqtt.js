import {
  MQTT_REGISTER_HANDLE,
  MQTT_TOPIC_SUBSCRIBE,
  MQTT_MESSAGE_RECEIVED,
  MQTT_MESSAGE_OUTGOING,
} from 'app/actions/mqtt';


const initialState = {
  handle: null,
  topics: {},
};

export default function mqttReducer(state = initialState, action) {
  switch (action.type) {
    case MQTT_REGISTER_HANDLE:
      return {
        ...state,
        handle: action.handle,
      };

    case MQTT_TOPIC_SUBSCRIBE:
      return {
        ...state,
        topics: {
          ...state.topics,
          [action.topic]: [],
        },
      };

    case MQTT_MESSAGE_RECEIVED:
      return {
        ...state,
        topics: {
          ...state.topics,
          [action.topic]: [...state.topics[action.topic], action.message],
        },
      };

    case MQTT_MESSAGE_OUTGOING:
    default:
      return state;
  }
}
