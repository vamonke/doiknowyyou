import React from 'react';
import { Router, Route, Switch } from 'react-router';
import { render } from 'react-dom';
import createBrowserHistory from 'history/createBrowserHistory';

import App from '../../ui/App';
import Lobby from '../../ui/Lobby';

const browserHistory = createBrowserHistory();

export const renderRoutes = () => (
  <Router history={browserHistory}>
    <Switch>
      <Route path="/" exact component={App} />
      <Route path="/:code" component={Lobby} />
    </Switch>
  </Router>
);