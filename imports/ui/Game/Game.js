import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { createContainer } from 'meteor/react-meteor-data';

import { Games } from '../../api/games.js';
import { Players } from '../../api/players.js';
import { Questions } from '../../api/questions.js';

import AnsweredQuestion from './AnsweredQuestion';
import QuestionResultsModal from './QuestionResultsModal';
import PlayerList from './PlayerList';
import CurrentQuestionBox from './CurrentQuestionBox';
import GameOver from './GameOver';

import './Game.css';

class Game extends Component {
  constructor(props) {
    super(props);
    this.toggleModal = this.toggleModal.bind(this);
    this.restartGame = this.restartGame.bind(this);
    // this.checkSessionId = this.checkSessionId.bind(this);
    this.state = {
      modalQuestionId: null,
      modalIsOpen: false
    }
  }

  componentDidMount() {
    Session.makePersistent('currentUserId');
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

  // checkSessionId(checks) {
  //   let currentUserId = Session.get('currentUserId');
  //   if (
  //     !currentUserId || (
  //       this.props.players.length > 0 &&
  //       !this.props.players.map(player => player._id).includes(currentUserId)
  //     )
  //   ) {
  //     checks.stop();
  //     this.props.history.push('/');
  //   }
  // }

  componentWillMount() {
    window.onbeforeunload = event => {
      let confirmationMessage = 'Exit game?';
      (event || window.event).returnValue = confirmationMessage;  // Gecko + IE
      return confirmationMessage;                                 // Webkit, Safari, Chrome
    };
    window.onpagehide = () => {};
    window.onunload = () => {};
  }

  toggleModal() {
    this.setState({
      modalIsOpen: false
    });
  }

  getCurrentQuestion() {
    let currentQuestionId = this.props.game.currentQuestion;
    return this.props.questions.find(question => question._id == currentQuestionId);
  }

  getRecipient(question) {
    if (question)
      return this.props.players.find(player => player._id == question.recipientId);
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

  addPlayer(newGameId) {
    Meteor.call('players.insert', this.props.viewer.name, newGameId, null, (error, player) => {
      Session.setTemp('currentUserId', player._id);
      this.props.history.push(`/lobby/${player.gameId}`);
    });
  }

  restartGame() {
    let nextId = this.props.game.nextId;
    if (nextId) {
      this.addPlayer(nextId);
    } else {
      let currentId = this.props.game._id;
      Meteor.call('games.restart', currentId, (error, newGameId) => {
        this.addPlayer(newGameId);
      });
    }
  }

  render() {
    let currentQuestion = this.getCurrentQuestion();
    let recipient = this.getRecipient(currentQuestion);
    return (
      <div>
        {this.props.game.status === 'started' && (
          <div className="paddingTop">
            <CurrentQuestionBox
              question={currentQuestion}
              recipient={recipient}
              viewer={this.props.viewer}
              toggleModal={this.toggleModal}
            />
            <div className="header">
              players
            </div>
          </div>
        )}
        {this.props.game.status === 'ended' && (
          <div>
            <GameOver players={this.props.players} />
            <div className="header">
              results
            </div>
          </div>
        )}

        <PlayerList
          question={currentQuestion}
          viewer={this.props.viewer}
          players={this.props.players}
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

        <QuestionResultsModal
          question={this.getPreviousQuestion()}
          players={this.props.players}
          modalIsOpen={this.state.modalIsOpen}
          toggleModal={this.toggleModal}
        />

        <div className="paddingTop paddingBottom" />

        { (this.props.game.status === 'ended') &&
          <button className="greenButton" onClick={this.restartGame}>
            Restart
          </button>
        }

        <div className="center paddingTop">
          <a href="/">Home</a>
        </div>

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
    _id: 'abc',
    status: 'started',
    currentQuestion: 'abc'
  },
  players: [],
  questions: [{
    _id: 'abc',
    recipientId: 'abc'
  }],
  viewer: {
    _id: 'abc',
    isReady: false
  },
}

export default createContainer(value => {
  Meteor.subscribe('games');
  Meteor.subscribe('players');
  Meteor.subscribe('questions');
  let gameId = value.match.params.id;
  return {
    game: Games.findOne(gameId),
    players: Players.find({ gameId: gameId }, { sort: { score: -1 } }).fetch(),
    questions: Questions.find({ gameId: gameId }).fetch(),
    viewer: Players.findOne({ _id: Session.get('currentUserId') }),
  };
}, Game);
