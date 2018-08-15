import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { createContainer } from 'meteor/react-meteor-data';
import { Answers } from '../../api/answers.js';

import { Card, Row, Col, Button, Modal, ModalHeader,  ModalBody, ModalFooter } from 'elemental';

import ResultsTable from './ResultsTable.js';
import './QuestionResults.css';

function QuestionResultsModal(props) {
  let recipient = props.players.find(player => (player._id === props.question.recipientId));
  let correctAnswer = props.question.options[props.question.correctAnswer];
  let modalHeader = (
    <div className="modalHeader">
      {'Round ' + props.question.round + ' results'}
    </div>
  );

  return (
    <Modal isOpen={props.modalIsOpen} onCancel={props.toggleModal} backdropClosesModal className="center">
      <ModalHeader text={modalHeader} showCloseButton onClose={props.toggleModal} />
      <ModalBody>
        <div className="resultsQuestion">
          {props.question.text}
        </div>
        <div className="recipient">
          {recipient && recipient.name}
          {'\'s answer: '}
          <div className="answer">
            {correctAnswer}
          </div>
        </div>
        <ResultsTable
          question={props.question}
          players={props.players}
          answers={props.answers}
        />
      </ModalBody>
      <ModalFooter>
        <Button onClick={props.toggleModal} type="primary" block>
          Continue
        </Button>
      </ModalFooter>
    </Modal>
  );
}

QuestionResultsModal.defaultProps = {
  question: {
    _id: 'abc',
    playerId: 'abc',
    text: '',
    recipient: 'abc',
    options: []
  },
  answers: [],
  players: [],
}

export default createContainer((props) => {
  let answers = [];
  if (props.question) {
    answers = Answers.find({ questionId: props.question._id }).fetch();
  }
  return { answers: answers };
}, QuestionResultsModal);
