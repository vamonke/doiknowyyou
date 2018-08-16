import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { createContainer } from 'meteor/react-meteor-data';

import { Card, Row, Col, Button } from 'elemental';
import { Link } from 'react-router-dom';

import Home from './Home';
import CreateGame from './CreateGame';
import JoinGame from './JoinGame';

import { Games } from '../../api/games.js';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mode: 'home'
    }
    this.showHome = this.showHome.bind(this);
    this.showJoinGame = this.showJoinGame.bind(this);
    this.showCreateGame = this.showCreateGame.bind(this);
    this.addPlayer = this.addPlayer.bind(this);
    this.createGame = this.createGame.bind(this);
  }

  componentDidUpdate() {
    document.title = `Do I Know You?`;
  }

  // renderGames() {
  //   let players = this.props.players;
  //   return this.props.games.map((game) => (
  //     <Card key={game._id}>
  //       <div className='gameTitle'>
  //         <Link to={`/lobby/${game.code}`}>
  //           {'Game '}
  //           {game.code}
  //         </Link>
  //       </div>
  //       {players.filter(player => (player.gameCode === game.code)).map((player, i) => (
  //         <Pill label={player.name} key={player._id} type='primary' />
  //       ))}
  //     </Card>
  //   ));
  // }

  showHome() {
    this.setState({
      mode: 'home'
    });
  }

  showJoinGame() {
    this.setState({
      mode: 'join'
    });
  }

  showCreateGame() {
    this.setState({
      mode: 'create'
    });
  }

  addPlayer(playerName, gameId, gameCode) {
    Meteor.call('players.insert', playerName, gameId, gameCode, (error, player) => {
      if (player && player.gameId) {
        Session.set('currentUserId', player._id);
        this.showHome();
        this.props.history.push(`/lobby/${player.gameId}`);
      } else {
        console.error('Game not found. Please check the game code.')
        // Highlight gameCode field
      }
    });
  }

  createGame(playerName) {
    Meteor.call('games.insert', (error, gameId) => {
      this.addPlayer(playerName, gameId, null);
    });
  }

  render() {
    return (
      <div className="bigCard">
        <Home showJoinGame={this.showJoinGame} showCreateGame={this.showCreateGame} />
        <CreateGame
          modalIsOpen={(this.state.mode === 'create')}
          createGame={this.createGame}
          showHome={this.showHome}
        />
        <JoinGame
          modalIsOpen={this.state.mode === 'join'}
          addPlayer={this.addPlayer}
          showHome={this.showHome}
        />
      </div>
    );
  }
}
