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

  submitAnswer(event) {
    const viewer = this.props.viewer;
    const currentQuestion = this.props.question;
    const answer = event.target.name;

    Meteor.call('answers.insert',
      this.props.question.gameCode,
      currentQuestion._id,
      viewer._id,
      answer
    );
  }

  render() {
    let currentQuestion = this.props.question;
    let buttonWidth = currentQuestion.options.length > 2 ? '100%' : '50%';
    return (
      <Card className="center">
        <div className="questionLight">
          {'Round ' + currentQuestion.round}
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
          {
            currentQuestion.options.map((option, index) => (
              <Col xs={buttonWidth} key={index} className="paddingBottom">
                <Button name={index} onClick={this.submitAnswer} type="primary" block>
                  {option}
                </Button>
              </Col>
            ))
          }
        </Row>
        {(this.props.recipient._id === this.props.viewer._id) && (
          <div>
            (Answer honestly and let the other players guess your answer)
          </div>
        )}
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
