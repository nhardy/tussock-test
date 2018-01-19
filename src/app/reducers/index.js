import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import { reducer as reduxAsyncConnect } from 'redux-connect';
import { reducer as scripts } from 'redux-scripts-manager';

import routeError from './routeError';
import github from './github';
import govhack from './govhack';
import mqtt from './mqtt';


export default combineReducers({
  reduxAsyncConnect,
  routing: routerReducer,
  scripts,

  routeError,
  github,
  govhack,
  mqtt,
});
