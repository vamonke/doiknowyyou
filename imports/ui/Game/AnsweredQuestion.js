import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { createContainer } from 'meteor/react-meteor-data';
import { Answers } from '../../api/answers.js';

import { Card, Row, Col, Button, Glyph } from 'elemental';

import './AnsweredQuestion.css';

class AnsweredQuestion extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false
    };
    this.toggleShow = this.toggleShow.bind(this);
    this.getPlayerNameFromAnswer = this.getPlayerNameFromAnswer.bind(this);
    this.getPlayerNameFromId = this.getPlayerNameFromId.bind(this);
  }

  getPlayerNameFromAnswer(answer) {
    let playerId = answer.playerId;
    return this.props.players.find((player) => (player._id === playerId)).name;
  }

  getPlayerNameFromId(playerId) {
    if (playerId) {
      let player = this.props.players.find((player) => (player._id === playerId));
      return player && player.name;
    };
  }

  toggleShow() {
    this.setState({
      show: !this.state.show
    });
  }

  correct() {
    return (
      <span className="correct">
        +1
      </span>
    );
  }

  render() {
    let recipient = this.props.players.find((player) => (player._id === this.props.question.recipientId));
    let correctOption = this.props.question.correctAnswer;
    return (
      <div className="center relative">
  	    <div className={`cardHeader ${this.state.show && 'highlight'}`} onClick={this.toggleShow}>
          {this.props.question.text}
          <Glyph icon="chevron-right" className="arrow" />
        </div>
        <div className={`cardShadow ${this.state.show && 'show'}`}>
          <div>
          <b>{recipient.name}:</b>
          {this.props.question.options[correctOption] ? ' Yes' : ' No' }
          </div>
  		    <div className="outline">
  		      <Row className="borderBottom">
  		        <Col xs="1/2" className="borderRight">
  		          <div className="option center">
  		            Yes
  		            {correctOption === 0 && this.correct()}
  		          </div>
  		        </Col>
  		        <Col xs="1/2">
  		          <div className="option center">
  		            No
  		            {correctOption === 1 && this.correct()}
  		          </div>
  		        </Col>
  		      </Row>          
  		      <Row>
  		        <Col xs="1/2" className="borderRight">
  		          {this.props.answers.filter((answer) => (answer.playerId != this.props.question.recipientId)).map((answer) => (
  		            (answer.selected === 0) && (
  		              <div key={answer._id} className="name">
  		                {this.getPlayerNameFromAnswer(answer)}
  		              </div>
  		            )
  		          ))}
  		        </Col>
  		        <Col xs="1/2">
  		          {this.props.answers.filter((answer) => (answer.playerId != this.props.question.recipientId)).map((answer) => (
  		            (answer.selected === 1) && (
  		              <div key={answer._id} className="name">
  		                {this.getPlayerNameFromAnswer(answer)}
  		              </div>
  		            )
  		          ))}
  		        </Col>
  		      </Row>
          </div>
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
