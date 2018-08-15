import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';
import { Card, Row, Col, Button, FormField, FormInput, Table } from 'elemental';

import { Players } from '../../api/players.js';
import { Answers } from '../../api/answers.js';

import './Game.css';

export default function CurrentQuestionBox(props) {
  function submitAnswer(event) {
    const answer = Number(event.target.name);
    Meteor.call('answers.insert',
      props.question.gameId,
      props.question._id,
      props.viewer._id,
      answer
    );
  }

  let currentQuestion = props.question;
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
        {props.recipient.name}
        {': '}
        <div className="underline" />
      </div>
      <hr />
      <div className="marginBottom">
        {(props.recipient._id !== props.viewer._id) && (
          `Guess ${props.recipient.name}'s answer`
        )}
      </div>
      <Row>
        {
          currentQuestion.options.map((option, index) => (
            <Col xs={buttonWidth} key={index} className="paddingBottom">
              <Button name={index} onClick={submitAnswer} type="primary" block>
                {option}
              </Button>
            </Col>
          ))
        }
      </Row>
      {(props.recipient._id === props.viewer._id) && (
        <div>
          (Answer honestly and let the other players guess your answer)
        </div>
      )}
    </Card>
  );
}

CurrentQuestionBox.propTypes = {
  recipient: PropTypes.shape({
    _id: PropTypes.string.isRequired,
  }),
  question: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    options: PropTypes.array.isRequired
  }),
  viewer: PropTypes.shape({
    _id: PropTypes.string.isRequired
  })
};

CurrentQuestionBox.defaultProps = {
  recipient: {
    _id: 'abc'
  },
  question: {
    _id: 'abc',
    options: []
  },
  viewer: {
    _id: 'abc',
    isReady: false
  },
}
