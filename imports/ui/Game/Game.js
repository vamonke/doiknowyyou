import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { createContainer } from 'meteor/react-meteor-data';

import { Games } from '../../api/games';
import { Players } from '../../api/players';
import { Questions } from '../../api/questions';

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
    this.completeQuestion = this.completeQuestion.bind(this);
    // this.checkSessionId = this.checkSessionId.bind(this);
    this.state = {
      modalQuestionId: null,
      modalIsOpen: false,
      showGameOver: false,
      restartDisabled: false,
    };
  }

  componentWillMount() {
    window.onbeforeunload = (event) => {
      const confirmationMessage = 'Exit game?';
      (event || window.event).returnValue = confirmationMessage; // Gecko + IE
      return confirmationMessage; // Webkit, Safari, Chrome
    };
    window.onpagehide = () => {};
    window.onunload = () => {};
  }

  componentDidMount() {
    Session.makePersistent('currentUserId');
  }

  componentDidUpdate() {
    const previousQuestion = this.getPreviousQuestion();
    if (previousQuestion && (previousQuestion._id !== this.state.modalQuestionId)) {
      this.setState({
        modalQuestionId: previousQuestion._id,
        modalIsOpen: true,
        showGameOver: false
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

  getCurrentQuestion() {
    const { currentQuestion } = this.props.game;
    return this.props.questions.find(question => question._id === currentQuestion);
  }

  getRecipient(question) {
    if (question) {
      return this.props.players.find(player => player._id === question.recipientId);
    }
    return {};
  }

  getAnsweredQuestions() {
    const answeredQuestions = this.props.questions.filter(question => (question.status === 'asked'));
    if (answeredQuestions.length !== 0) {
      answeredQuestions.sort((a, b) => (new Date(b.answeredAt) - new Date(a.answeredAt)));
      return answeredQuestions;
    }
    return [];
  }

  getPreviousQuestion() {
    const answeredQuestions = this.getAnsweredQuestions();
    if (answeredQuestions.length === 0) {
      return null;
    }
    return answeredQuestions[0];
  }

  getPlayer(id) {
    return this.props.players.find(player => (player._id === id));
  }

  toggleModal() {
    this.setState({
      modalIsOpen: false,
      showGameOver: true
    });
  }

  addPlayer(newGameId) {
    return new Promise((resolve, reject) => {
      Meteor.call('players.insert', this.props.viewer.name, newGameId, null, (error, player) => {
        if (error) {
          return reject(error);
        }
        if (player && player.gameId) {
          Session.setTemp('currentUserId', player._id);
          this.props.history.push(`/lobby/${player.gameId}`);
          return resolve(true);
        }
        console.error('Failed to add player to game.');
        return resolve(false);
      });
    });
  }

  async restartGame() {
    const { nextId } = this.props.game;
    this.setState({ restartDisabled: true });
    try {
      if (nextId) {
        await this.addPlayer(nextId);
      } else {
        const currentId = this.props.game._id;
        Meteor.call('games.restart', currentId, async (error, newGameId) => {
          if (error) throw error;
          await this.addPlayer(newGameId);
        });
      }
    } catch (error) {
      this.setState({ restartDisabled: false });
    }
  }

  completeQuestion() {
    const currentQuestion = this.getCurrentQuestion();
    console.log(currentQuestion);
    const questionId = currentQuestion._id;
    if (questionId) {
      Meteor.call('questions.complete', questionId, (error) => {
        if (error) {
          return console.error(error);
        }
        return console.log('Complete: ', questionId);
      });
    }
  }

  render() {
    const currentQuestion = this.getCurrentQuestion();
    const recipient = this.getRecipient(currentQuestion);
    const previousQuestion = this.getPreviousQuestion();
    return (
      <div>
        {this.props.game.status === 'started' && (
          <div className="paddingTop">
            <CurrentQuestionBox
              question={currentQuestion}
              recipient={recipient}
              viewer={this.props.viewer}
            />
            {(this.props.viewer && this.props.viewer.name === 'Varick') && (
              <button type="button" onClick={this.completeQuestion} className="redButton">
                Complete question
              </button>
            )}
            <div className="header">
              players
            </div>
          </div>
        )}
        {this.props.game.status === 'ended' && (
          <div>
            <GameOver players={this.props.players} open={this.state.showGameOver} />
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

        { this.getAnsweredQuestions().length > 0
          ? (
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

        {previousQuestion && (
          <QuestionResultsModal
            question={previousQuestion}
            players={this.props.players}
            modalIsOpen={this.state.modalIsOpen}
            toggleModal={this.toggleModal}
          />
        )}

        <div className="paddingTop paddingBottom" />

        {this.props.game.status === 'ended' && (
          <button
            type="button"
            className="greenButton"
            onClick={this.restartGame}
            disabled={this.state.restartDisabled}
          >
            Restart
          </button>
        )}

        <div className="center paddingTop">
          <a href="/">Home</a>
        </div>

      </div>
    );
  }
}

Game.propTypes = {
  game: PropTypes.shape({
    _id: PropTypes.string,
    status: PropTypes.string,
    nextId: PropTypes.string,
    currentQuestion: PropTypes.string,
  }),
  players: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
    })
  ),
  questions: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
      recipientId: PropTypes.string,
    })
  ),
  viewer: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
  }),
};

Game.defaultProps = {
  game: {
    _id: '',
    status: 'started',
    currentQuestion: '',
  },
  players: [],
  questions: [],
  viewer: {
    _id: '',
    name: '',
    isReady: false,
  },
};

export default createContainer((value) => {
  Meteor.subscribe('games');
  Meteor.subscribe('players');
  Meteor.subscribe('questions');
  const gameId = value.match.params.id;
  return {
    game: Games.findOne(gameId),
    players: Players.find({ gameId: gameId }, { sort: { score: -1 } }).fetch(),
    questions: Questions.find({ gameId: gameId }).fetch(),
    viewer: Players.findOne({ _id: Session.get('currentUserId') }),
  };
}, Game);
