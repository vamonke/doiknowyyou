import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Card, Row, Col, Button, Modal, ModalHeader,  ModalBody, ModalFooter } from 'elemental';

import './QuestionResults.css';

export default function QuestionResults(props) {
  function getPlayerNameFromAnswer(answer) {
    let playerId = answer.playerId;
    return props.players.find((player) => (player._id === playerId)).name;
  }
  function getPlayerNameFromId(playerId) {
    if (playerId) {
      let player = props.players.find((player) => (player._id === playerId));
      return player && player.name;
    };
  }
  function correct() {
    return (
      <span className="correct">
        +1
      </span>
    );
  }
  let recipient = props.players.find((player) => (player._id === props.question.recipientId));
  let recipientIndex = props.answers.findIndex((answer) => (answer.playerId === props.question.recipientId));
  props.answers.splice(recipientIndex, 1);
  let correctOption = props.question.correctAnswer;

  let modalHeader = (
    <div className="modalHeader">
      Round 1 results
    </div>
  );

  return (
    <Modal isOpen={props.modalIsOpen} onCancel={props.toggleModal} backdropClosesModal className="center">
      <ModalHeader text={modalHeader} showCloseButton onClose={props.toggleModal} />
      <ModalBody>
        <div className="resultsQuestion">
          {'Q: '}
          {props.question.text}
        </div>
        <div className="recipient">
          {recipient && recipient.name}
          {'\'s answer: '}
          <div className="answer">
            {props.question.options[correctOption] ? 'Yes' : 'No' }
          </div>
        </div>
        <div className="outline">
          <Row className="borderBottom">
            <Col xs="1/2" className="borderRight">
              <div className="option center">
                Yes
                {correctOption === 0 && correct()}
              </div>
            </Col>
            <Col xs="1/2">
              <div className="option center">
                No
                {correctOption === 1 && correct()}
              </div>
            </Col>
          </Row>          
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
        </div>
      </ModalBody>
      <ModalFooter>
        <Button onClick={props.toggleModal} type="primary" block>
          Continue
        </Button>
      </ModalFooter>
    </Modal>
  );
}

QuestionResults.defaultProps = {
  question: {
    gameCode: null,
    playerId: 'abc',
    text: '',
    recipient: 'abc',
    options: [true, false]
  },
  answers: [
    {
      playerId: 'abc',
      selected: 0,
    }
  ],
  players: [
    {
      _id: 'abc',
      name: '',
    },
  ],
}