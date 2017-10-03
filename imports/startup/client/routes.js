import React from 'react';
import { Router, Route, Switch } from 'react-router';
import createBrowserHistory from 'history/createBrowserHistory';

import App from '../../ui/App/App';
import Lobby from '../../ui/Lobby/Lobby';
import Game from '../../ui/Game/Game';

const browserHistory = createBrowserHistory();

export const renderRoutes = () => (
  <Router history={browserHistory}>
    <div className="container">
      <Switch>
        <Route path="/" exact component={App} />
        <Route path="/lobby/:code" component={Lobby} />
        <Route path="/game/:code" component={Game} />
      </Switch>
    </div>
  </Router>
);