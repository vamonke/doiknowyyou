import React, { Component } from 'react';
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types';
import { createContainer } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Link } from 'react-router-dom';
import { Table, Card, FormField, FormInput, Button, Pill } from 'elemental';

import { Games } from '../api/games.js';
import { Players } from '../api/players.js';
import { Questions } from '../api/questions.js';

// Game lobby component
class Lobby extends Component {
  constructor(props) {
    super(props);
    this.addQuestions = this.addQuestions.bind(this);
    this.editQuestions = this.editQuestions.bind(this);
  }

  componentDidUpdate() {
    document.title = this.props.game.code;
  }

  addQuestions() {
    let q1 = ReactDOM.findDOMNode(this.q1).value.trim();
    let q2 = ReactDOM.findDOMNode(this.q2).value.trim();
    let q3 = ReactDOM.findDOMNode(this.q3).value.trim();
    let gameCode = this.props.game.code;
    let playerId = Session.get('currentUserId');
    let qna = [
      {
        question: q1,
        answers: [true, false]
      },
      {
        question: q2,
        answers: [true, false]
      },
      {
        question: q3,
        answers: [true, false]
      },
    ];
    Meteor.call('questions.insert', gameCode, playerId, qna);
    Meteor.call('players.ready', playerId);
    this.setState({
      editable: false
    });
  }

  editQuestions() {
    let playerId = Session.get('currentUserId');
    Meteor.call('players.unReady', playerId);
    this.setState({
      editable: true
    });
  }

  renderPlayers() {
    return this.props.players.map((player) => {
      let playerName = (player._id === this.props.viewer._id) ? (<strong>{player.name}</strong>) : player.name;
      return (
        <tr key={player._id}>
          <td>
            {playerName}
          </td>
          <td>
            {player.isReady && 'Ready'}
          </td>
        </tr>
      )
    });
  }
  render() {
    Session.set('currentUserId', 'ukgjDMXfDTrbW8cYW');
    return (
      <div className="container">
        <Link to={'/'}>Home</Link>

        <div className="title">
          QUESTIONS
        </div>

        <Card>
          <FormField>
            <FormInput
              ref={(input) => { this.q1 = input; }}
              disabled={this.props.viewer.isReady}
              placeholder="Question 1"
              autoFocus
            />
          </FormField>
          <FormField>
            <FormInput
              ref={(input) => { this.q2 = input; }}
              disabled={this.props.viewer.isReady}
              placeholder="Question 2"
            />
          </FormField>
          <FormField>
            <FormInput
              ref={(input) => { this.q3 = input; }}
              disabled={this.props.viewer.isReady}
              placeholder="Question 3"
            />
          </FormField>  
          {(this.props.viewer.isReady) ? (
            <Button onClick={this.editQuestions} type="link" block>
              Edit questions
            </Button>
          ) : (
            <Button onClick={this.addQuestions} type="success" block>
              Ready
            </Button>
          )}
        </Card>

        <div className="title">
          PLAYERS
        </div>

        <Card>
          <Table>
            <colgroup>
              <col width="" />
              <col width="50" />
            </colgroup>
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {this.renderPlayers()}
            </tbody>
          </Table>
        </Card>

      </div>
    );
  }
}

Lobby.propTypes = {
  players: PropTypes.array.isRequired,
  game: PropTypes.shape({
    code: PropTypes.number,
  })
};
 
Lobby.defaultProps = {
  game: {
    code: null
  },
  viewer: {
    isReady: false
  }
}

export default createContainer((value) => {
  let code = Number(value.match.params.code);
  Meteor.subscribe('games');
  Meteor.subscribe('players');
  return {
    game: Games.findOne({ code: code }),
    players: Players.find({ gameCode: code }).fetch(),
    viewer: Players.findOne({ _id: Session.get('currentUserId') }),
  };
}, Lobby);