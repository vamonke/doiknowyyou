import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import { Table } from 'elemental';
import { Answers } from '../../api/answers.js';

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
    let question = this.props.question;
    return this.props.players.map(player => {
      let isRecipient = player._id === question.recipientId;
      let playerName = (player._id === viewer._id) ? (<strong>{player.name}</strong>) : player.name;
      return (
        <tr key={player._id}>
          <td>
            {player.score}
          </td>
          <td>
            {playerName}
            { (isRecipient && !this.props.ended) ? (<span className="answering">ANSWERING</span>) : '' }
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
  players: [{
    _id: 'abc'
  }],
  question: {
    _id: null,
    recipientId: 'abc'
  },
  answers: [],
  viewer: {
    _id: 'abc',
  },
};

export default createContainer(props => {
  Meteor.subscribe('answers');
  let answers = [];
  if (!props.ended && props.question && props.question._id) {
    answers = Answers.find({ questionId: props.question._id }).fetch();
  }
  return {
    players: props.players,
    question: props.question,
    answers: answers,
    viewer: props.viewer,
    ended: props.ended,
  };
}, PlayerList);
