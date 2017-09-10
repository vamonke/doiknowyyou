import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { createContainer } from 'meteor/react-meteor-data';

import { Card, Row, Col, Button, FormField, FormInput, Pill } from 'elemental';
import { Link } from 'react-router-dom';

import { Games } from '../../api/games.js';
import { Players } from '../../api/players.js';

// App component - represents the whole app
class App extends Component {
  constructor(props) {
    super(props);
    this.renderGames = this.renderGames.bind(this);
    this.renderPlayers = this.renderPlayers.bind(this);
    this.addPlayer = this.addPlayer.bind(this);
    this.createGame = this.createGame.bind(this);
    this.joinGame = this.joinGame.bind(this);
  }
  renderGames() {
    let players = this.props.players;
    return this.props.games.map((game) => (
      <Card key={game._id}>
        <div className='gameTitle'>
          <Link to={`/lobby/${game.code}`}>
            {'Game '}
            {game.code}
          </Link>
        </div>
        {players.filter(player => (player.gameCode === game.code)).map((player, i) => (
          <Pill label={player.name} key={player._id} type='primary' />
        ))}
      </Card>
    ));
  }

  renderPlayers() {
    return this.props.players.map((player) => (
      <Card key={player._id}>
        {player.name}
        {' '}
        {player.gameCode}
      </Card>
    ));
  }

  handleSubmit(event) {
    if(event.keyCode == 13) {
      event.preventDefault();
      return false;
    }
   }

  addPlayer(gameCode) {
    let name = ReactDOM.findDOMNode(this.name).value;
    Meteor.call('players.insert', name, gameCode, (error, playerId) => {
      Session.set('currentUserId', playerId);
      this.props.history.push(`/lobby/${gameCode}`);
    });
    ReactDOM.findDOMNode(this.name).value = '';
  }

  createGame() {
    Meteor.call('games.insert', (error, game) => {
      this.addPlayer(game.code);
    });
    ReactDOM.findDOMNode(this.code).value = '';
  }

  joinGame() {
    let code = Number(ReactDOM.findDOMNode(this.code).value.trim());
    this.addPlayer(code);
    ReactDOM.findDOMNode(this.code).value = '';
  }

  render() {
    return (
      <div className="paddingTop">
        <FormField>
          <FormInput ref={(input) => { this.name = input; }} placeholder="Enter name" type="text" autoFocus />
        </FormField>
        <FormField>
          <FormInput ref={(input) => { this.code = input; }} placeholder="Enter code" type="text" />
        </FormField>
        <Row>
          <Col basis="25%">
            <Button onClick={this.joinGame.bind(this)} type="primary" block={true}>
              Join game
            </Button>
          </Col>
          <Col basis="25%">
            <Button onClick={this.createGame.bind(this)} type="success" block={true}>
              Create new game
            </Button>
          </Col>
        </Row>
        {/*
        <p>Games</p>
        {this.renderGames()}
      
        <p>Players</p>
        {this.renderPlayers()}
        */}
      </div>
    );
  }
}

App.propTypes = {
  games: PropTypes.array.isRequired,
  players: PropTypes.array.isRequired,
};
 
export default createContainer(() => {
  Meteor.subscribe('games');
  Meteor.subscribe('players');
  return {
    games: Games.find({}, { sort: { createdAt: -1 } }).fetch(),
    players: Players.find({}).fetch(),
  };
}, App);