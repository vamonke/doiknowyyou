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
    this.checkSessionId = this.checkSessionId.bind(this);
    this.state = {
      stage: 0,
      questions: [{}, {}, {}]
    }
  }
  componentDidUpdate() {
    document.title = `Game ${this.props.game.code}`;
    this.checkSessionId();
  }

  checkSessionId() {
    let currentUserId = Session.get('currentUserId');
    if (
      !currentUserId || (
        this.props.players.length > 0 &&
        !this.props.players.map(player => player._id).includes(currentUserId)
      )
    ) {
      this.props.history.push('/');
    }
  }

  componentWillMount() {
    window.onbeforeunload = event => {
      let confirmationMessage = 'Exit game?';
      (event || window.event).returnValue = confirmationMessage;  // Gecko + IE
      return confirmationMessage;                                 // Webkit, Safari, Chrome
    };

    window.onpagehide = this.removePlayer;
    window.onunload = this.removePlayer;
  }

  componentWillUnmount() {
    window.onpagehide = () => {};
    window.onunload = () => {};
  }

  removePlayer() {
    let playerId = Session.get('currentUserId');
    Meteor.call('players.remove', playerId);
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
    const gameId = this.props.game._id;
    const playerId = Session.get('currentUserId');

    Meteor.call('questions.insert', gameId, playerId, qna);
    Meteor.call('players.ready', playerId, gameId);
  }

  editQuestions() {
    let playerId = Session.get('currentUserId');
    Meteor.call('players.unReady', playerId);
    this.setState({ stage: 0 });
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

  waitingBooth() {
    if (this.props.game.status == 'started') {
      return (
        <div className="center paddingBottom">
          <Countdown gameId={this.props.game._id} startGame={this.startGame}/>
        </div>
      );
    }
    return (
      <div className="center">
        <div id="preloader">
          <div id="loader"></div>
        </div>
        <div className="paddingBottom">
          Waiting for
          {this.props.players.length === 1 ? ' more ' : ' other '}
          players
        </div>
        <button className="whiteButton" onClick={this.editQuestions}>
          <Glyph icon="pencil" />
          {' Edit questions'}
        </button>
      </div>
    );
  }

  startGame() {
    let id = this.props.game._id;
    this.props.history.push(`/game/${id}`);
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
        <div className="paddingTop paddingBottom" />
        <div className="center">
          <a href="/">Home</a>
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
    code: PropTypes.number,
    _id: PropTypes.string
  })
};

Lobby.defaultProps = {
  game: {
    code: null,
    _id: null
  },
  players: [],
  viewer: {
    isReady: false
  },
  questions: []
}

export default createContainer(value => {
  let gameId = value.match.params.id;
  Meteor.subscribe('games');
  Meteor.subscribe('games');
  Meteor.subscribe('players');
  Meteor.subscribe('questions');
  let players = Players.find({ gameId: gameId }).fetch();
  let viewer = players.find(player => player._id == Session.get('currentUserId'));
  let questions = viewer ? Questions.find({ playerId: viewer._id, gameCode: gameId }).fetch() : [];
  return {
    game: Games.findOne(gameId),
    players: players,
    questions: questions,
    viewer: viewer
  };
}, Lobby);
