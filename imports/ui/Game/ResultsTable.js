import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Row, Col } from 'elemental';

import parseQuestionResults from './parseQuestionResults.js';
import './QuestionResults.css';

export default function ResultsTable(props) {
  const correct = (
    <span className="correct">
      +1
    </span>
  );
  const answers = props.answers.slice(0); // Duplicate props.answers array
  const recipientIndex = answers.findIndex(answer => (answer.playerId === props.question.recipientId));
  if (recipientIndex > -1) {
    answers.splice(recipientIndex, 1);
  }
  const answerSets = parseQuestionResults(props.question, props.players, answers);
  const { options } = props.question;
  const correctOptions = props.question.correctAnswer;

  function playersWhoSelected(option) {
    const answerSet = answerSets.find(answerSet => (answerSet.option == option));
    if (answerSet) {
      return answerSet.players.map(player => (
        <div key={player}>
          {player}
        </div>
      ))
    }
  }

  return (
    <div className="outline center">
      {options.map((option, index) => (
        <Row key={option} className="borderBottom">
          <Col xs="1/2" className="borderRight cellPadding grayBackground">
            <b>
              {option}
              {(correctOptions && correctOptions.includes(index)) && correct}
            </b>
          </Col>
          <Col key={option} xs="1/2" className="borderRight cellPadding">
            {playersWhoSelected(option)}
          </Col>
        </Row>
      ))}
    </div>
  );
}

ResultsTable.propTypes = {
  question: PropTypes.shape({
    options: PropTypes.array,
  }),
  players: PropTypes.array,
  answers: PropTypes.array
};
