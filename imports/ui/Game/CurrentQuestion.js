import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { createContainer } from 'meteor/react-meteor-data';

import { Link } from 'react-router-dom';
import { Card, Row, Col, Button, FormField, FormInput, Table } from 'elemental';

import { Players } from '../../api/players.js';
import { Answers } from '../../api/answers.js';

import './Game.css';

class CurrentQuestion extends Component {
  constructor(props) {
    super(props);
    this.submitAnswer = this.submitAnswer.bind(this);
  }

  submitAnswer(answer) {
    let viewer = this.props.viewer;
    let currentQuestion = this.props.question;

    Meteor.call('answers.insert',
      this.props.question.gameCode,
      currentQuestion._id,
      viewer._id,
      answer
    );
  }

  render() {
    let currentQuestion = this.props.question;
    return (
      <Card className="center">
        <div className="questionLight">
          Round 1
        </div>
        <hr />
        <div className="currentQuestion">
          {currentQuestion.text}
          <br />
          {this.props.recipient.name}
          {': '}
          <div className="underline" />
        </div>
        <hr />
        <div className="marginBottom">
          {(this.props.recipient._id !== this.props.viewer._id) && (
            `Guess ${this.props.recipient.name}'s answer`
          )}
        </div>
        <Row>
          <Col xs="1/2">
            <Button onClick={() => this.submitAnswer(0)} type="primary" block>Yes</Button>
          </Col>
          <Col xs="1/2">
            <Button onClick={() => this.submitAnswer(1)} type="primary" block>No</Button>
          </Col>
        </Row>
        <div className="marginTop">
          {(this.props.recipient._id === this.props.viewer._id) && (
            '(Answer honestly and let the other players guess your answer)'
          )}
        </div>
      </Card>
    );
  }
}

CurrentQuestion.propTypes = {
  players: PropTypes.array,
  answers: PropTypes.array,
};

CurrentQuestion.defaultProps = {
  players: [],
  question: {
    _id: null,
    gameCode: null,
    playerId: null,
  },
  viewer: {
    _id: '',
    isReady: false
  },
}

export default createContainer(props => {
  return {
    question: props.question,
    questionOwner: props.questionOwner,
    recipient: Players.findOne({ gameCode: props.gameCode, isRecipient: true }),
    viewer: Players.findOne({ _id: Session.get('currentUserId') }),
  };
}, CurrentQuestion);
