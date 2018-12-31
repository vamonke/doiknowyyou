import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { createContainer } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Glyph } from 'elemental';

import { Games } from '../../api/games';
import { Players } from '../../api/players';

import Countdown from './Countdown';
import QuestionSet from './QuestionSet';
import PlayersCard from './PlayersCard';

import './Lobby.css';

function getPlayerNames(players) {
  return players.map(player => player.name);
}

function removePlayer() {
  const playerId = Session.get('currentUserId');
  Meteor.call('players.remove', playerId);
}

// Game lobby component
class Lobby extends Component {
  constructor(props) {
    super(props);
    this.submitQuestions = this.submitQuestions.bind(this);
    this.changeQuestion = this.changeQuestion.bind(this);
    this.editQuestions = this.editQuestions.bind(this);
    this.waitingBooth = this.waitingBooth.bind(this);
    this.startGame = this.startGame.bind(this);
    this.checkSessionId = this.checkSessionId.bind(this);
    this.state = {
      stage: 0,
      questions: [{}, {}, {}],
    };
  }

  componentWillMount() {
    window.onbeforeunload = (event) => {
      const confirmationMessage = 'Exit game?';
      // eslint-disable-next-line no-param-reassign
      (event || window.event).returnValue = confirmationMessage; // Gecko + IE
      return confirmationMessage; // Webkit, Safari, Chrome
    };
    window.onpagehide = removePlayer;
    window.onunload = removePlayer;
  }

  componentDidUpdate() {
    const { game: { code } } = this.props;
    document.title = `Game ${code}`;
    this.checkSessionId();
  }

  componentWillUnmount() {
    window.onpagehide = () => {};
    window.onunload = () => {};
  }

  checkSessionId() {
    const { players } = this.props;
    const currentUserId = Session.get('currentUserId');
    if (
      !currentUserId || (
        players.length > 0
        && !players.map(player => player._id).includes(currentUserId)
      )
    ) {
      console.error('Player not found');
      const { history: push } = this.props;
      push('/');
    }
  }

  changeQuestion(questionNo, qna, direction) {
    const { questions, stage } = this.state;
    questions[questionNo] = qna;
    const newStage = stage + (direction ? 1 : -1);
    this.setState({
      questions,
      stage: newStage,
    });
    if (newStage === 3) {
      this.submitQuestions();
    }
  }

  submitQuestions() {
    const { questions } = this.state;
    const { game: { _id } } = this.props;
    const playerId = Session.get('currentUserId');

    Meteor.call('questions.insert', _id, playerId, questions);
    Meteor.call('players.ready', playerId, _id);
  }

  editQuestions() {
    const playerId = Session.get('currentUserId');
    Meteor.call('players.unReady', playerId);
    this.setState({ stage: 0 });
  }

  waitingBooth(game, players) {
    if (game.status === 'started') {
      return (
        <div className="center paddingBottom">
          <Countdown gameId={game._id} startGame={this.startGame} />
        </div>
      );
    }
    return (
      <div className="center">
        <div id="preloader">
          <div id="loader" />
        </div>
        <div className="paddingBottom">
          {`Waiting for ${players.length === 1 ? ' more ' : ' other '} players`}
        </div>
        <button type="button" className="whiteButton" onClick={this.editQuestions}>
          <Glyph icon="pencil" />
          {' Edit questions'}
        </button>
      </div>
    );
  }

  startGame() {
    const { history, game: { _id } } = this.props;
    history.push(`/game/${_id}`);
  }

  render() {
    const {
      game,
      game: { code },
      players,
      viewer,
    } = this.props;
    const { stage } = this.state;
    const playerNames = getPlayerNames(players);
    return (
      <div>
        <div className="center relative">
          {'Game Code: '}
          <strong>{code}</strong>
        </div>
        <div className="header">your questions</div>
        <div className="card animateHeight">
          {[1, 2, 3].map((qNo, index) => (
            <QuestionSet
              key={`q + ${qNo}`}
              display={stage === index}
              playerNames={playerNames}
              questionNo={index}
              ready={this.submitQuestions}
              changeQuestion={this.changeQuestion}
            />
          ))}
          {stage === 3 && this.waitingBooth(game, players)}
        </div>

        <div className="header">players</div>
        <PlayersCard players={players} viewer={viewer} />

        <div className="paddingTop paddingBottom" />
        <div className="center">
          <a href="/">Home</a>
        </div>
      </div>
    );
  }
}

Lobby.propTypes = {
  game: PropTypes.shape({
    code: PropTypes.number,
    _id: PropTypes.string,
  }),
  players: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
    }),
  ),
  history: PropTypes.shape({
    push: PropTypes.func,
  }),
  viewer: PropTypes.shape({
    isReady: PropTypes.bool,
  }),
};

Lobby.defaultProps = {
  game: {
    code: null,
    _id: null,
  },
  players: [],
  viewer: {
    isReady: false,
  },
  history: {
    push: () => null,
  },
};

export default createContainer((value) => {
  const gameId = value.match.params.id;
  Meteor.subscribe('games');
  Meteor.subscribe('players');
  const game = Games.findOne(gameId);
  const players = Players.find({ gameId }).fetch();
  const viewer = players.find(player => player._id === Session.get('currentUserId'));
  return { game, players, viewer };
}, Lobby);
