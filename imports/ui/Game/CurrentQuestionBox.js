import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { createContainer } from 'meteor/react-meteor-data';
import { Card, Row, Col, Button } from 'elemental';

import './Game.css';

class CurrentQuestionBox extends Component {
  constructor(props) {
    super(props);
    this.submitAnswer = this.submitAnswer.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
    this.state = {
      selected: null,
    }
  }

  componentWillReceiveProps(newProps) { // Reset state on question change
    if (newProps.question._id != this.props.question._id)
      this.setState({ selected: null });
  }

  submitAnswer(answer) {
    Meteor.call('answers.insert',
      this.props.question.gameId,
      this.props.question._id,
      this.props.viewer._id,
      answer
    );
  }

  handleSelect(event) {
    const answer = Number(event.target.name);
    this.setState({ selected: answer });
    this.submitAnswer(answer);
  }

  render() {
    let currentQuestion = this.props.question;
    let multiline =
      currentQuestion.options.length > 2 ||
      currentQuestion.options.some(option => option.length > 26);
    let buttonWidth = multiline ? '100%' : '50%';
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
                <button
                  name={index}
                  className={`blueButton${this.state.selected == index ? ' selected' : ''}`}
                  onClick={this.handleSelect}>
                  {option}
                </button>
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
  };
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
    _id: ''
  },
  question: {
    _id: '',
    options: []
  },
  viewer: {
    _id: '',
    isReady: false
  },
}

export default createContainer(props => props, CurrentQuestionBox);