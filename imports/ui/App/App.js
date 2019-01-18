import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';

import Home from './Home';
import CreateGame from './CreateGame';
import JoinGame from './JoinGame';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mode: 'home',
    };
    this.showHome = this.showHome.bind(this);
    this.showJoinGame = this.showJoinGame.bind(this);
    this.showCreateGame = this.showCreateGame.bind(this);
    this.addPlayer = this.addPlayer.bind(this);
    this.createGame = this.createGame.bind(this);
  }

  componentDidUpdate() {
    document.title = 'Do I Know You?';
  }

  showHome() {
    this.setState({
      mode: 'home',
    });
  }

  showJoinGame() {
    this.setState({
      mode: 'join',
    });
  }

  showCreateGame() {
    this.setState({
      mode: 'create',
    });
  }

  addPlayer(playerName, gameId, gameCode) {
    return new Promise((resolve, reject) => {
      Meteor.call('players.insert', playerName, gameId, gameCode, (error, player) => {
        if (error) {
          return reject(error);
        }
        if (player && player.gameId) {
          Session.setPersistent('currentUserId', player._id);
          this.showHome(); // For closing modal
          resolve(true);
          return this.props.history.push(`/lobby/${player.gameId}`);
        }
        console.error('Failed to add player to game.');
        return resolve(false);
      });
    });
  }

  createGame(playerName) {
    return new Promise((resolve, reject) => {
      Meteor.call('games.insert', async (error, gameId) => {
        if (error) {
          return reject(error);
        }
        return resolve(this.addPlayer(playerName, gameId, null));
      });
    });
  }

  render() {
    const { mode } = this.state;
    return (
      <div className="bigCard">
        <Home showJoinGame={this.showJoinGame} showCreateGame={this.showCreateGame} />
        <CreateGame
          modalIsOpen={(mode === 'create')}
          createGame={this.createGame}
          showHome={this.showHome}
        />
        <JoinGame
          modalIsOpen={mode === 'join'}
          addPlayer={this.addPlayer}
          showHome={this.showHome}
        />
      </div>
    );
  }
}
