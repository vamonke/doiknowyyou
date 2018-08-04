import React, { Component } from 'react';
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types';
import { createContainer } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Table, Card, FormField, FormInput, Button, Spinner, Glyph } from 'elemental';

import { Games } from '../../api/games.js';
import { Players } from '../../api/players.js';
import { Questions } from '../../api/questions.js';

import Countdown from './Countdown';
import QuestionSet from './QuestionSet';

import './Lobby.css';


// Game lobby component
class Lobby extends Component {
  constructor(props) {
    super(props);
    this.submitQuestions = this.submitQuestions.bind(this);
    this.changeQuestion = this.changeQuestion.bind(this);
    this.editQuestions = this.editQuestions.bind(this);
    this.getPlayerNames = this.getPlayerNames.bind(this);
    this.waitingBooth = this.waitingBooth.bind(this);
    this.startGame = this.startGame.bind(this);
    this.state = {
      stage: 0,
      questions: [{}, {}, {}]
    }
  }

  componentDidUpdate() {
    document.title = `Game ${this.props.game.code}`;
  }

  changeQuestion(questionNo, qna, direction) {
    let questions = this.state.questions;
    questions[questionNo] = qna;
    const newStage = this.state.stage + (direction ? 1 : -1);
    this.setState({
      questions: questions,
      stage: newStage
    });
    if (newStage === 3) {
      this.submitQuestions();
    }
  }

  submitQuestions() {
    const qna = this.state.questions;
    const gameCode = this.props.game.code;
    const playerId = Session.get('currentUserId');

    Meteor.call('questions.insert', gameCode, playerId, qna);
    Meteor.call('players.ready', playerId);
  }

  editQuestions() {
    let playerId = Session.get('currentUserId');
    Meteor.call('players.unReady', playerId);
    this.setState({ stage: 2 });
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
            {
              player.isReady ?
              <div className="ready">Ready</div>
              :
              'Not ready'
            }
          </td>
        </tr>
      )
    });
  }

  getPlayerNames() {
    return this.props.players.map(player => player.name);
  }

  displayGameStatus() {
    let ready = (this.props.viewer && !this.props.viewer.isReady) ? null : "appear";
    let players = this.props.players;
    let gameStatus = (
      <div className={`center popDown ${ready}`}>
        <Spinner type="primary" className="paddingRight"/>
        Waiting for players to get ready
      </div>
    );
    for (let i = 0; i < players.length; i += 1) {
      if (!players[i].isReady) {
        return gameStatus;
      }
    };
    return (
      <div className={`center popDown ${ready}`}>
        <Countdown gameCode={this.props.gameCode} startGame={this.startGame}/>
      </div>
    );
  }

  waitingBooth() {
    let allReady = this.props.players.every(player => player.isReady);
    let submittedQuestions = this.props.questions.map((question, index, questions) => {
      return (
        <div key={index}>
          {question.text}
          {index !== questions.length && (<hr />)}
        </div>
      );
    })
    let gameStatus = allReady ? (
      <div className="paddingBottom">
        <Countdown gameCode={this.props.gameCode} startGame={this.startGame}/>
      </div>
    ) : (
      <div className="paddingBottom">
        <div id="preloader">
          <div id="loader"></div>
        </div>
        Waiting for other players
      </div>
    );
    return (
      <div className="center">
        {gameStatus}
        {/* submittedQuestions */}
        <button className="whiteButton" onClick={this.editQuestions}>
          <Glyph icon="pencil" />
          {' Edit questions'}
        </button>
      </div>
    );
  }

  startGame() {
    let code = this.props.game.code;
    Meteor.call('games.start', code);
    this.props.history.push(`/game/${code}`);
  }

  render() {
    return (
      <div>
        <div className="center relative">
          Game Code:
          {' '}
          <strong>
            {this.props.game.code}
          </strong>
        </div>
        <div className="header">
          your questions
        </div>
        <div className="card animateHeight">
          {['','',''].map((_, index) => {
            return (
              <QuestionSet
                key={index}
                display={this.state.stage === index}
                playerNames={this.getPlayerNames()}
                questionNo={index}
                ready={this.submitQuestions}
                changeQuestion={this.changeQuestion} />
            );
          })}
          {this.state.stage === 3 && this.waitingBooth()}
        </div>
        {/* this.displayGameStatus() */}

        <div className="header">
          players
        </div>
        <div className="card">
          <Table className="reduceTop">
            <colgroup>
              <col width="" />
              <col width="100" />
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
          {/*<div className="center">
            <Button type="hollow-primary" size="sm">
              <Glyph icon="plus" className="plusIcon" />
              {' '}
              Invite friends
            </Button>
          </div>*/}
        </div>
      </div>
    );
  }
}

Lobby.propTypes = {
  players: PropTypes.array.isRequired,
  questions: PropTypes.array.isRequired,
  viewer: PropTypes.shape({
    isReady: PropTypes.bool
  }),
  game: PropTypes.shape({
    code: PropTypes.number
  })
};

Lobby.defaultProps = {
  game: {
    code: null
  },
  players: [],
  viewer: {
    isReady: false
  },
  questions: []
}

export default createContainer((value) => {
  let code = Number(value.match.params.code);
  Meteor.subscribe('games');
  Meteor.subscribe('players');
  Meteor.subscribe('questions');
  let players = Players.find({ gameCode: code }).fetch();
  let viewer = players.find(player => player._id == Session.get('currentUserId'));
  let questions = viewer ? Questions.find({ playerId: viewer._id, gameCode: code }).fetch() : [];
  return {
    game: Games.findOne({ code: code }),
    players: players,
    questions: questions,
    viewer: viewer
  };
}, Lobby);
