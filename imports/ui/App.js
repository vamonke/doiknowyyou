import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import { Card, Row, Col, Button, FormField, FormInput } from 'elemental';
import { Link } from 'react-router-dom';
 
import Game from './Game.js';
import { Games } from '../api/games.js';
import { Players } from '../api/players.js';

// App component - represents the whole app
class App extends Component { 
  renderGames() {
    return this.props.games.map((game) => (
      <Link to={`/${game.code}`} key={game._id}>
        <Card>
          {game.code}
        </Card>
      </Link>
    ));
  }

  renderPlayers() {
    return this.props.players.map((player) => (
      <Card key={player._id}>
        {player.name}
      </Card>
    ));
  }
 
  handleSubmit(event) {
    if(event.keyCode == 13) {
      event.preventDefault();
      return false;
    }
   }

  createGame() {
    const name = ReactDOM.findDOMNode(this.refs.nameInput).value.trim();
    let newGame = Meteor.call('games.insert', (error, game) => {
      Meteor.call('players.insert', name, game._id);
    });
  }

  render() {
    return (
      <div className="container">
        <div className="title">DO I KNOW YOU?</div>
        <FormField>
          <FormInput ref="nameInput" placeholder="Enter name" type="text" autoFocus />
        </FormField>
        <Row>
          <Col basis="25%">
            <Button type="primary" block={true}>
              Join game
            </Button>
          </Col>
          <Col basis="25%">
            <Button onClick={this.createGame.bind(this)} type="success" block={true}>
              Create new game
            </Button>
          </Col>
        </Row>

        <p>Games</p>
        {this.renderGames()}
      
        <p>Players</p>
        {this.renderPlayers()}

      </div>
    );
  }
}

App.propTypes = {
  games: PropTypes.array.isRequired,
};
 
export default createContainer(() => {
  return {
    games: Games.find({}, { sort: { createdAt: -1 } }).fetch(),
    players: Players.find({}).fetch(),
  };
}, App);