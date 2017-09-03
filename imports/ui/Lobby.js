import React, { Component } from 'react';
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types';
import { createContainer } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Table, Card, FormField, FormInput, Button, Pill } from 'elemental';

import { Games } from '../api/games.js';
import { Players } from '../api/players.js';
import { Questions } from '../api/questions.js';

import './Lobby.css';

// Game lobby component
class Lobby extends Component {
  constructor(props) {
    super(props);
    this.addQuestions = this.addQuestions.bind(this);
    this.editQuestions = this.editQuestions.bind(this);
    this.startGame = this.startGame.bind(this);
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

  renderQuestions() {
    return this.props.questions.map((question) => {
      return (
        <Card key={question._id}>
          {question.text}
        </Card>
      )
    });
  }

  displayStartButton() {
    let players = this.props.players;
    for (let i = 0; i < players.length; i += 1) {
      if (!players[i].isReady) {
        return null;
      }
    };
    return (
      <div className="fixed">
        <div className="buttonWrap">
          <Button onClick={this.startGame} type="success" block>
            Start
          </Button>
        </div>
      </div>
    );
  }

  startGame() {
    let code = this.props.game.code;
    Meteor.call('games.start', code);
    Meteor.call('questions.select');
    this.props.history.push(`/game/${code}`);
  }

  render() {
    Session.set('currentUserId', 'ukgjDMXfDTrbW8cYW');
    return (
      <div>
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
              value="Do I like fruits?"
            />
          </FormField>
          <FormField>
            <FormInput
              ref={(input) => { this.q2 = input; }}
              disabled={this.props.viewer.isReady}
              placeholder="Question 2"
              value="Have I failed an exam?"
            />
          </FormField>
          <FormField>
            <FormInput
              ref={(input) => { this.q3 = input; }}
              disabled={this.props.viewer.isReady}
              placeholder="Question 3"
              value="Am I vain?"
            />
          </FormField>  
          {(this.props.viewer.isReady) ? (
            <Button onClick={this.editQuestions} type="link" block>
              Edit questions
            </Button>
          ) : (
            <Button onClick={this.addQuestions} type="primary" block>
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
        {this.renderQuestions()}
        {this.displayStartButton()}
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
  Meteor.subscribe('questions');
  return {
    game: Games.findOne({ code: code }),
    players: Players.find({ gameCode: code }).fetch(),
    questions: Questions.find({ gameCode: code }).fetch(),
    viewer: Players.findOne({ _id: Session.get('currentUserId') }),
  };
}, Lobby);
