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
              '-'
            }
          </td>
        </tr>
      )
    });
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
        <div className="card">
          <div className="center paddingBottom">
            Write questions to ask other players
          </div>
          {['','',''].map((_, index) => {
            return (
              <div key={index} style={{display: (this.state.stage === index) ? 'block' : 'none'}}>
                <QuestionSet
                  questionNo={index}
                  ready={this.submitQuestions}
                  changeQuestion={this.changeQuestion} />
              </div>
            );
          })}

          {this.props.viewer.isReady && (
            <button className="whiteButton" onClick={this.editQuestions}>
              Edit questions
            </button>
          )}
        </div>
        {this.displayGameStatus()}

        <div className="header">
          players
        </div>
        <div className="card">
          <Table className="reduceTop">
            <colgroup>
              <col width="" />
              <col width="80" />
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
