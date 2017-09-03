import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { createContainer } from 'meteor/react-meteor-data';

import { Link } from 'react-router-dom';
import { Card, Row, Col, Button, FormField, FormInput, Table } from 'elemental';
 
import { Games } from '../api/games.js';
import { Players } from '../api/players.js';
import { Questions } from '../api/questions.js';
import { Answers } from '../api/answers.js';

import './Game.css';

class Game extends Component {
  submitAnswer(answer) {
    console.log(answer);
    Meteor.call('answers.insert',
      this.props.game.code,
      this.props.currentQuestion._id,
      this.props.viewer._id,
      answer
    );
  }

  renderPlayers() {
    return this.props.players.map((player) => {
      let playerName = (player._id === this.props.viewer._id) ? (<strong>{player.name}</strong>) : player.name;
      let playerAnswer = this.props.answers.filter(answer =>
        (answer.playerId === player._id) && (this.props.currentQuestion._id === answer.questionId)
      )[0];
      return (
        <tr key={player._id}>
          <td>
            5
          </td>
          <td>
            {playerName}
          </td>
          <td>
            {playerAnswer ? playerAnswer.selected : 'Recipient'}
          </td>
        </tr>
      )
    });
  }

  renderQuestion() {
    let currentQuestion = this.props.currentQuestion;
    if (currentQuestion) {
      let questionOwner = this.props.players.filter(player => (player._id === currentQuestion.playerId))[0];
      if (questionOwner) {
        return (
          <Card className="center">
            <div className="questionLight">
              Q1: From Varick to Adam
            </div>
            <hr />
            <div className="currentQuestion">
              {currentQuestion.text}
            </div>
            <hr />
            <div className="questionDark">
              Guess Adam's answer
            </div>
            <Row>
              <Col xs="1/2">
                <Button onClick={() => this.submitAnswer('Yes')} type="primary" block>Yes</Button>
              </Col>
              <Col xs="1/2">
                <Button onClick={() => this.submitAnswer('No')} type="primary" block>No</Button>
              </Col>
            </Row>
          </Card>
        );
      }
    };
  }

  render() {
    Session.set('currentUserId', 'ukgjDMXfDTrbW8cYW');
    let owner = this.renderQuestion();
    return (
      <div>
        <div className="title">
          GAME
        </div>
        {owner}
        <div className="title">
          PLAYERS
        </div>
        <Card>
          <Table>
            <colgroup>
              <col width="50px" />
              <col width="" />
              <col width="40%" />
            </colgroup>
            <thead>
              <tr>
                <th>Score</th>
                <th>Name</th>
                <th>Answer</th>
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

Game.propTypes = {
  players: PropTypes.array.isRequired,
  game: PropTypes.shape({
    code: PropTypes.number,
  })
};

Game.defaultProps = {
  game: {
    code: null
  },
  viewer: {
    isReady: false
  },
  currentQuestion: {
    id: ''
  }
}

export default createContainer((value) => {
  let code = Number(value.match.params.code);
  Meteor.subscribe('games');
  Meteor.subscribe('players');
  Meteor.subscribe('questions');
  Meteor.subscribe('answers');
  return {
    game: Games.findOne({ code: code }),
    players: Players.find({ gameCode: code }).fetch(),
    questions: Questions.find({ gameCode: code }).fetch(),
    answers: Answers.find({ gameCode: code }).fetch(),
    currentQuestion: Questions.findOne({ selected: true }),
    viewer: Players.findOne({ _id: Session.get('currentUserId') }),
  };
}, Game);
