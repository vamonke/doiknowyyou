import React from 'react';
import { Router, Route, Switch } from 'react-router';
import { render } from 'react-dom';
import createBrowserHistory from 'history/createBrowserHistory';
import { Link } from 'react-router-dom';

import App from '../../ui/App/App';
import Lobby from '../../ui/Lobby/Lobby';
import Game from '../../ui/Game/Game';

import { Button } from 'elemental';

const browserHistory = createBrowserHistory();

export const renderRoutes = () => (
  <Router history={browserHistory}>
    <div className="container">
      <div className="logo">
        <div className="title">
          <Link to={'/'}>
            DO I KNOW YOU?
          </Link>
        </div>
      </div>
      <Switch>
        <Route path="/" exact component={App} />
        <Route path="/lobby/:code" component={Lobby} />
        <Route path="/game/:code" component={Game} />
      </Switch>
    </div>
  </Router>
);