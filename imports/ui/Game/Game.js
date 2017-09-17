import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { createContainer } from 'meteor/react-meteor-data';

import { Link } from 'react-router-dom';
import { Card, Row, Col, Button, FormField, FormInput, Table } from 'elemental';
 
import { Games } from '../../api/games.js';
import { Players } from '../../api/players.js';
import { Questions } from '../../api/questions.js';
import { Answers } from '../../api/answers.js';

import AnsweredQuestion from './AnsweredQuestion';
import QuestionResults from './QuestionResults';

import './Game.css';

class Game extends Component {
  constructor(props){
    super(props);
    this.toggleModal = this.toggleModal.bind(this);
    this.state = {
      modalQuestionId: null,
      modalIsOpen: false
    }
  }
  componentDidUpdate() {
    let previousQuestion = this.getPreviousQuestion();
    if (this.state.modalQuestionId !== previousQuestion.text) {
      this.setState({
        modalQuestionId: previousQuestion.text,
        modalIsOpen: true
      });
    }
  }
  toggleModal() {
    this.setState({
      modalIsOpen: false
    });
  }
  getCurrentQuestion() {
    return this.props.questions.find((question) => (question.status === 'asking'));
  }
  getRecipient() {
    return this.props.players.find((player) => player.isRecipient);
  }
  getAnsweredQuestions() {
    let answeredQuestions = this.props.questions.filter((question) => (question.status === 'asked'));
    if (answeredQuestions.length !== 0) {
      answeredQuestions.sort((a,b) => ( new Date(b.answeredAt) - new Date(a.answeredAt)));
      return answeredQuestions;
    }
    return [];
  }
  getPreviousQuestion() {
    let answeredQuestions = this.getAnsweredQuestions();
    if (answeredQuestions.length !== 0) {
      return answeredQuestions[0];
    }
  }
  getQuestionAnswers() {
    let previousQuestion = this.getPreviousQuestion();
    return this.props.answers.filter((answer) => (
      answer && previousQuestion && (answer.questionId === previousQuestion._id)
    ));
  }
  submitAnswer(answer) {
    let viewer = this.props.viewer;
    let currentQuestion = this.getCurrentQuestion();

    Meteor.call('answers.insert',
      this.props.game.code,
      currentQuestion._id,
      viewer._id,
      answer,
      (error, hasAllAnswered) => {
        console.log(hasAllAnswered);
        if (hasAllAnswered) {
          this.setState({
            modalIsOpen: true
          });
        }
      }
    );
  }
  hasPlayerAnswered(playerId) {
    let currentQuestion = this.getCurrentQuestion();
    let answer = this.props.answers.filter((answer) => (
      answer &&
      currentQuestion &&
      (answer.questionId === currentQuestion._id) &&
      (answer.playerId === playerId)
    ));
    return answer.length > 0;
  }
  renderPlayers() {
    let viewer = this.props.viewer;
    let recipient = this.getRecipient();
    let currentQuestion = this.getCurrentQuestion();
    return this.props.players.map((player) => {
      let isRecipient = (recipient && player._id === recipient._id);
      let playerName = (viewer && player._id === viewer._id) ? (<strong>{player.name}</strong>) : player.name;
      return (
        <tr key={player._id}>
          <td>
            {player.score}
          </td>
          <td>
            {playerName}
            { isRecipient ? (<span className="answering">ANSWERING</span>) : '' }
          </td>
          <td className="done">
            {this.hasPlayerAnswered(player._id) && 'Done' }
          </td>
        </tr>
      )
    });
  }

  renderQuestion() {
    let currentQuestion = this.getCurrentQuestion();
    if (currentQuestion) {
      let questionOwner = this.props.players.find(player => (player._id === currentQuestion.playerId));
      let recipient = this.getRecipient();
      if (questionOwner && recipient) {
        return (
          <Card className="center">
            <div className="questionLight">
              {`Q1: From ${questionOwner.name} to ${recipient.name}`}
            </div>
            <hr />
            <div className="currentQuestion">
              {currentQuestion.text}
            </div>
            <hr />
            <div className="marginBottom">
              {(recipient._id !== this.props.viewer._id) && (
                `Guess ${recipient.name}'s answer`
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
              {(recipient._id === this.props.viewer._id) && (
                '(Answer honestly and let the other players guess your answer)'
              )}
            </div>
          </Card>
        );
      }
    };
  }

  render() {
    return (
      <div>
        {this.props.game.status === 'started' && (
          <div className="paddingTop">
            {this.renderQuestion()}
            <div className="title">
              PLAYERS
            </div>
          </div>
        )}
        {this.props.game.status === 'ended' && (
          <div className="title">
            RESULTS
          </div>
        )}
        <Card>
          <Table>
            <colgroup>
              <col width="50" />
              <col width="" />
              <col width="80" />
            </colgroup>
            <thead>
              <tr>
                <th>Score</th>
                <th>Name</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {this.renderPlayers()}
            </tbody>
          </Table>
        </Card>
       <div className="title">
          PREVIOUS QUESTIONS
        </div>
        {this.getAnsweredQuestions().length > 0 ?
          this.getAnsweredQuestions().map((question) => (
            <AnsweredQuestion
              key={question._id}
              question={question} 
              players={this.props.players.filter((player) => (player._id === question.playerId ))}
              answers={this.getQuestionAnswers()}
            />
          )) : (
            <div className="center questionLight">
              No questions answered yet
            </div>
          )
        }

        <QuestionResults
          question={this.getPreviousQuestion()}
          players={this.props.players}
          answers={this.getQuestionAnswers()}
          modalIsOpen={this.state.modalIsOpen}
          toggleModal={this.toggleModal}
        />

      </div>
    );
  }
}

Game.propTypes = {
  players: PropTypes.array,
  questions: PropTypes.array,
  answers: PropTypes.array,
};

Game.defaultProps = {
  game: {
    code: null,
  },
  players: [],
  questions: [
    {
      _id: null,
      status: ''
    }
  ],
  answers: [],
  viewer: {
    _id: '',
    isReady: false
  },
}

export default createContainer((value) => {
  Meteor.subscribe('games');
  Meteor.subscribe('players');
  Meteor.subscribe('questions');
  Meteor.subscribe('answers');
  let gameCode = Number(value.match.params.code);
  return {
    game: Games.findOne({ code: gameCode }),
    players: Players.find({ gameCode: gameCode }, { sort: { score: -1 } }).fetch(),
    questions: Questions.find({ gameCode: gameCode }).fetch(),
    answers: Answers.find({ gameCode: gameCode }).fetch(),
    viewer: Players.findOne({ _id: Session.get('currentUserId') }),
  };
}, Game);
