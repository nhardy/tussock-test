import { applyMiddleware, compose, createStore } from 'redux';
import thunk from 'redux-thunk';

import fetchMiddleware from 'app/middleware/fetch';
import nprogressMiddleware from 'app/middleware/nprogress';
import gaMiddleware from 'app/middleware/ga';
import mqttMiddleware from 'app/middleware/mqtt';
import mqttClient from 'app/lib/mqtt';
import { messageReceived } from 'app/actions/mqtt';
import reducer from '../reducers';


export default function create(initialState) {
  const store = createStore(reducer, initialState, compose(
    applyMiddleware(
      thunk,
      fetchMiddleware,
      nprogressMiddleware,
      gaMiddleware,
      mqttMiddleware,
    ),
    __CLIENT__ && __DEVELOPMENT__ && window.devToolsExtension
      ? window.devToolsExtension()
      : f => f,
  ));

  mqttClient.on('message', (topic: string, message: Buffer) => {
    store.dispatch(messageReceived(topic, JSON.parse(message.toString())));
  });

  if (__DEVELOPMENT__) {
    if (module.hot) { // `module.hot` is injected by Webpack
      // Enable hot module reducer replacement
      module.hot.accept('../reducers', () => {
        store.replaceReducer(require('../reducers').default); // eslint-disable-line global-require
      });
    }
  }

  return store;
}
