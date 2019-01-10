import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { createContainer } from 'meteor/react-meteor-data';
import { Answers } from '../../api/answers.js';

import { Modal, ModalHeader,  ModalBody, ModalFooter } from 'elemental';

import ResultsTable from './ResultsTable.js';
import './QuestionResults.css';

function QuestionResultsModal(props) {
  let recipient = props.players.find(player => (player._id === props.question.recipientId)) || '';
  let modalHeader = (
    <div className="modalHeader">
      {'Round ' + props.question.round + ' results'}
    </div>
  );

  function displayCorrect() {
    if (!props.question.correctAnswer || props.question.correctAnswer.length === 0)
      return '-';
    let correctAnswers = props.question.correctAnswer.map(correct => props.question.options[correct]);
    if (correctAnswers.length === 1)
      return correctAnswers[0];
    return correctAnswers.map((answer, index) => {
      console.log(index);
      return (
        <div>
          {answer}
          {correctAnswers.length-1 !== index && (<hr />)}
        </div>
      );
    });
  }

  return (
    <Modal isOpen={props.modalIsOpen} onCancel={props.toggleModal} backdropClosesModal className="center">
      <ModalHeader text={modalHeader} showCloseButton onClose={props.toggleModal} />
      <ModalBody>
        <div className="resultsQuestion">
          {props.question.text}
        </div>
        <div className="roundedCorners">
          <div className="recipient">
            {recipient && recipient.name}
            {'\'s '}
            {props.question.correctAnswer && props.question.correctAnswer.length > 1 ? 'answers: ' : 'answer: '}
          </div>
          <div className="answer">
            {displayCorrect()}
          </div>
        </div>
        <ResultsTable
          question={props.question}
          players={props.players}
          answers={props.answers}
        />
      </ModalBody>
      <ModalFooter>
        <button className="blueButton" onClick={props.toggleModal}>
          Continue
        </button>
      </ModalFooter>
    </Modal>
  );
}

QuestionResultsModal.defaultProps = {
  question: {
    _id: '',
    playerId: '',
    text: '',
    recipient: '',
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
