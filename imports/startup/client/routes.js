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

function logIn() {
  let userIds = [
    'G8NyM7gS9XT3b2x8W',
    '8p96cfQDd4jwBPeJb',
    'qdqMfQpgAA54AvgkK',
  ];
  let no = 0;
  for (let i = 0; i < userIds.length; i += 1) {
    if (userIds[i] === Session.get('currentUserId')) {
      no = (i+1)%userIds.length;
      break;
    }
  }
  Session.set('currentUserId', userIds[no]);
}


export const renderRoutes = () => (
  <Router history={browserHistory}>
    <div className="container">
      <div className="logo">
        <div className="title">
          <Link to={'/'}>
            DO I KNOW YOU?
          </Link>
        </div>
        <Button onClick={logIn} className="floatRight">Next Log In</Button>
      </div>
      <Switch>
        <Route path="/" exact component={App} />
        <Route path="/lobby/:code" component={Lobby} />
        <Route path="/game/:code" component={Game} />
      </Switch>
    </div>
  </Router>
);