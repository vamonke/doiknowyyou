import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { createContainer } from 'meteor/react-meteor-data';
import { Answers } from '../../api/answers.js';

import { Card, Row, Col, Button, Glyph } from 'elemental';

import ResultsTable from './ResultsTable.js';
import './AnsweredQuestion.css';

class AnsweredQuestion extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false
    };
    this.toggleShow = this.toggleShow.bind(this);
  }

  toggleShow() {
    this.setState({
      show: !this.state.show
    });
  }

  render() {
    let recipient = this.props.players.find((player) => (player._id === this.props.question.recipientId));
    let correctOption = this.props.question.correctAnswer;
    return (
      <div className="relative">
  	    <div className={`cardHeader ${this.state.show && 'highlight'}`} onClick={this.toggleShow}>
          <span className="round">
            {this.props.question.round}
          </span>
          {this.props.question.text}
          <Glyph icon="chevron-down" className="arrow" />
        </div>
        <div className={`cardShadow center ${this.state.show && 'show'}`}>
          <div>
            <b>{recipient.name}: </b>
            {correctOption ? this.props.question.options[correctOption] : '-'}
          </div>
          <ResultsTable
            question={this.props.question}
            players={this.props.players}
            answers={this.props.answers}
          />
  	    </div>
      </div>
    );
  }
}

export default createContainer((props) => {
  let answers = (props.question) ? Answers.find({ questionId: props.question._id }).fetch() : [];
  return {
    players: props.players,
    question: props.question,
    answers: answers
  };
}, AnsweredQuestion);
