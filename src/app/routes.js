// @flow

import React from 'react';
import { Route, IndexRoute } from 'react-router';

import type { ReduxStore } from 'app/flowTypes';
import { clearRouteError } from 'app/actions/routeError';
import App from 'app/components/App';
import HomeView from 'app/views/Home';
// import ProjectsView from 'app/views/Projects';
// import ContactView from 'app/views/Contact';
// import CurriculumVitaeView from 'app/views/CurriculumVitae';
// import GovHackView from 'app/views/GovHack';
import ErrorView from 'app/views/Error';

// eslint-disable-next-line import/no-commonjs
// const SouthOf45View = __DEVELOPMENT__ ? require('app/views/SouthOf45').default : null;


export default function getRoutes(store: ReduxStore) {
  const onChange = () => {
    store.dispatch(clearRouteError());
  };
  return (
    <Route path="/" component={App} onChange={onChange}>
      <Route path="/__404" component={ErrorView} status={404} />
      <Route path="/__500" component={ErrorView} status={500} />
      <IndexRoute component={HomeView} />
      {/* <Route path="/projects" component={ProjectsView} />
      <Route path="/contact" component={ContactView} />
      <Route path="/cv" component={CurriculumVitaeView} />
      <Route path="/govhack" component={GovHackView} />
      {__DEVELOPMENT__ && <Route path="/govhack/south-of-45" component={SouthOf45View} />} */}
      <Route path="*" component={ErrorView} status={404} />
    </Route>
  );
}
