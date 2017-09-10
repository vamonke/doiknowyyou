import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Row, Col } from 'elemental';

import './QuestionResults.css';

export default function ResultsTable(props) {
  return (
    <Row>
      <Col xs="1/2" className="borderRight">
        {props.answers.map((answer) => (
          (answer.selected === 0) && (
            <div key={answer._id} className="name">
              {getPlayerNameFromAnswer(answer)}
            </div>
          )
        ))}
      </Col>
      <Col xs="1/2">
        {props.answers.map((answer) => (
          (answer.selected === 1) && (
            <div key={answer._id} className="name">
              {getPlayerNameFromAnswer(answer)}
            </div>
          )
        ))}
      </Col>
    </Row>
  )
}