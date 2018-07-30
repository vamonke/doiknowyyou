import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { createContainer } from 'meteor/react-meteor-data';

import { Link } from 'react-router-dom';
import { Card, Row, Col, Button, FormField, FormInput, Table } from 'elemental';

import { Games } from '../../api/games.js';
import { Players } from '../../api/players.js';
import { Questions } from '../../api/questions.js';

import AnsweredQuestion from './AnsweredQuestion';
import QuestionResults from './QuestionResults';
import PlayerList from './PlayerList';
import CurrentQuestion from './CurrentQuestion';

import './Game.css';

class Game extends Component {
  constructor(props) {
    super(props);
    this.toggleModal = this.toggleModal.bind(this);
    this.restartGame = this.restartGame.bind(this);
    this.state = {
      modalQuestionId: null,
      modalIsOpen: false
    }
  }
  componentDidUpdate() {
    let previousQuestion = this.getPreviousQuestion();
    if (previousQuestion && (previousQuestion._id !== this.state.modalQuestionId)) {
      this.setState({
        modalQuestionId: previousQuestion._id,
        modalIsOpen: true
      });
    }
  }
  toggleModal() {
    this.setState({
      modalIsOpen: false
    });
  }
  getCurrentQuestion() {
    return this.props.questions.find((question) => (question.status === 'asking'));
  }
  getRecipient() {
    return this.props.players.find((player) => player.isRecipient);
  }
  getAnsweredQuestions() {
    let answeredQuestions = this.props.questions.filter((question) => (question.status === 'asked'));
    if (answeredQuestions.length !== 0) {
      answeredQuestions.sort((a,b) => ( new Date(b.answeredAt) - new Date(a.answeredAt)));
      return answeredQuestions;
    }
    return [];
  }
  getPreviousQuestion() {
    let answeredQuestions = this.getAnsweredQuestions();
    if (answeredQuestions.length !== 0) {
      return answeredQuestions[0];
    }
  }
  getPlayer(id) {
    return this.props.players.find(player => (player._id === id));
  }

  addPlayer(gameCode) {
    Meteor.call('players.insert', this.props.viewer.name, gameCode, (error, playerId) => {
      Session.set('currentUserId', playerId);
      this.props.history.push(`/lobby/${gameCode}`);
    });
  }

  restartGame() {
    let nextCode = this.props.game.nextCode;
    if (nextCode) {
      this.addPlayer(nextCode);
    } else {
      let currentCode = this.props.game.code;
      Meteor.call('games.restart', currentCode, (error, newGame) => {
        this.addPlayer(newGame.code);
      });
    }
  }

  render() {
    return (
      <div>
        {this.props.game.status === 'started' && (
          <div className="paddingTop">
            <CurrentQuestion
              gameCode={this.props.game.code}
              question={this.getCurrentQuestion()}
              questionOwner={this.getPlayer(this.getCurrentQuestion().playerId)}
              toggleModal={this.toggleModal}
            />
            <div className="header">
              players
            </div>
          </div>
        )}
        {this.props.game.status === 'ended' && (
          <div className="header">
            results
          </div>
        )}

        <PlayerList
          gameCode={this.props.game.code}
          question={this.getCurrentQuestion()}
          ended={this.props.game.status === 'ended'}
        />

        <div className="header">
          previous questions
        </div>

        { this.getAnsweredQuestions().length > 0 ?
          (
            <div className="card lessPadding">
              { this.getAnsweredQuestions().map((question, i) => (
                <div key={question._id}>
                  { i !== 0 && <div className="border" /> }
                  <AnsweredQuestion
                    question={question}
                    players={this.props.players}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="center questionLight">
              No questions answered yet
            </div>
          )
        }

        <QuestionResults
          question={this.getPreviousQuestion()}
          players={this.props.players}
          modalIsOpen={this.state.modalIsOpen}
          toggleModal={this.toggleModal}
        />

        { (this.props.game.status === 'ended') &&
          <button className="greenButton" onClick={this.restartGame}>
            Restart
          </button>
        }

        <center>
          <p>
            <a href="/">Home</a>
          </p>
        </center>

      </div>
    );
  }
}

Game.propTypes = {
  players: PropTypes.array,
  questions: PropTypes.array,
};

Game.defaultProps = {
  game: {
    code: null,
    status: 'ended'
  },
  players: [],
  questions: [
    {
      _id: null,
      status: ''
    }
  ],
  viewer: {
    _id: '',
    isReady: false
  },
}

export default createContainer((value) => {
  Meteor.subscribe('games');
  Meteor.subscribe('players');
  Meteor.subscribe('questions');
  let gameCode = Number(value.match.params.code);
  return {
    game: Games.findOne({ code: gameCode }),
    players: Players.find({ gameCode: gameCode }, { sort: { score: -1 } }).fetch(),
    questions: Questions.find({ gameCode: gameCode }).fetch(),
    viewer: Players.findOne({ _id: Session.get('currentUserId') }),
  };
}, Game);
