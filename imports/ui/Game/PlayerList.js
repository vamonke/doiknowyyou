import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { createContainer } from 'meteor/react-meteor-data';

import { Table } from 'elemental';

import { Players } from '../../api/players.js';
import { Answers } from '../../api/answers.js';

import AnsweredQuestion from './AnsweredQuestion';
import QuestionResults from './QuestionResults';

import './Game.css';

class PlayerList extends Component {
  constructor(props) {
    super(props);
    this.hasPlayerAnswered = this.hasPlayerAnswered.bind(this);
  }
  hasPlayerAnswered(playerId) {
    const answered = this.props.answers.some(answer => answer.playerId === playerId);
    return answered;
  }
  renderPlayers() {
    let viewer = this.props.viewer;
    let recipient = this.props.players.find((player) => player.isRecipient);
    return this.props.players.map((player) => {
      let isRecipient = (recipient && player._id === recipient._id);
      let playerName = (player._id === viewer._id) ? (<strong>{player.name}</strong>) : player.name;
      return (
        <tr key={player._id}>
          <td>
            {player.score}
          </td>
          <td>
            {playerName}
            { isRecipient ? (<span className="answering">ANSWERING</span>) : '' }
          </td>
          <td className="done">
            {this.hasPlayerAnswered(player._id) && 'Done' }
          </td>
        </tr>
      )
    });
  }

  render() {
    return (
      <div className="card">
        <Table>
          <colgroup>
            <col width="50" />
            <col width="" />
            <col width="80" />
          </colgroup>
          <thead>
            <tr>
              <th>Score</th>
              <th>Name</th>
              { !this.props.ended && <th>Status</th> }
            </tr>
          </thead>
          <tbody>
            {this.renderPlayers()}
          </tbody>
        </Table>
      </div>
    );
  }
}

PlayerList.propTypes = {
  players: PropTypes.array,
  questions: PropTypes.array,
  answers: PropTypes.array,
};

PlayerList.defaultProps = {
  gameCode: null,
  players: [],
  question: {
    _id: null,
  },
  answers: [],
  viewer: {
    _id: '',
  },
}


export default createContainer((props) => {
  Meteor.subscribe('players');
  Meteor.subscribe('answers');
  const gameCode = Number(props.gameCode);
  let answers = [];
  if (!props.ended && props.question && props.question._id) {
    answers = Answers.find({ questionId: props.question._id }).fetch();
  }
  return {
    players: Players.find({ gameCode: gameCode }, { sort: { score: -1 } }).fetch(),
    answers: answers,
    viewer: Players.findOne({ _id: Session.get('currentUserId') }),
    ended: props.ended,
  };
}, PlayerList);
