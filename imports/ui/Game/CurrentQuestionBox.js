import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { createContainer } from 'meteor/react-meteor-data';
import { Row, Col } from 'elemental';

import OpenEndedAnswer from './OpenEndedAnswer';

class CurrentQuestionBox extends Component {
  constructor(props) {
    super(props);
    this.submitAnswer = this.submitAnswer.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
    this.state = { selected: null };
  }

  componentWillReceiveProps(newProps) { // Reset state on question change
    const { question } = this.props;
    if (newProps.question._id !== question._id) {
      this.setState({ selected: null });
    }
  }

  submitAnswer(answer) {
    const { question, viewer } = this.props;
    Meteor.call('answers.insert',
      question.gameId,
      question._id,
      viewer._id,
      answer);
  }

  handleSelect(event) {
    const answer = Number(event.target.name);
    this.setState({ selected: answer });
    this.submitAnswer(answer);
  }

  render() {
    const { question, recipient, viewer, playerCount } = this.props;
    const { selected } = this.state;
    const isLoading = !question.text || !recipient.name;
    if (isLoading) {
      return (
        <div className="card center">
          <div className="questionLight">
            Loading question
          </div>
          <hr />
          <div id="greySpinner" />
        </div>
      );
    }
    const multiline = (question.options && question.options.length > 2)
    || question.options.some(option => option.length > 26);
    const buttonWidth = multiline ? '100%' : '50%';
    return (
      <div className="card center">
        <div className="questionLight">
          {`Round ${question.round}`}
        </div>
        <hr />
        <div className="currentQuestion">
          {question.text}
          <br />
          {recipient.name}
          {': '}
          <div className="underline" />
        </div>
        <hr />
        { question.format === 'open' ? (
          // Open-ended question
          <OpenEndedAnswer
            viewerId={viewer._id}
            question={question}
            recipientName={recipient.name}
            submitAnswer={this.submitOpenAnswer}
            playerCount={playerCount}
          />
        ) : (
          // Close-ended question
          <div>
            <div className="marginBottom">
              <i>
                {(recipient._id !== viewer._id) && (
                  `Guess ${recipient.name}'s answer`
                )}
              </i>
            </div>
            <Row>
              {question.options.map((option, index, array) => (
                <Col
                  xs={buttonWidth}
                  key={index}
                  className={(!multiline || index === array.length - 1) ? '' : 'paddingBottom'}
                >
                  <button
                    type="button"
                    name={index}
                    className={`blueButton${selected === index ? ' selected' : ''}`}
                    onClick={this.handleSelect}
                  >
                    {option}
                  </button>
                </Col>
              ))}
            </Row>
            {(recipient._id === viewer._id) && (
              <div id="honestly"><i>Answer honestly and let the other players guess your answer</i></div>
            )}
          </div>
        )}
      </div>
    );
  }
}

CurrentQuestionBox.propTypes = {
  recipient: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
  }),
  question: PropTypes.shape({
    _id: PropTypes.string,
    options: PropTypes.array,
  }),
  viewer: PropTypes.shape({
    _id: PropTypes.string,
  }),
  playerCount: PropTypes.number,
};

CurrentQuestionBox.defaultProps = {
  recipient: {
    _id: '',
    name: '',
  },
  question: {
    _id: '',
    options: [],
  },
  viewer: {
    _id: '',
    isReady: false,
  },
  playerCount: 100,
};

export default createContainer(props => props, CurrentQuestionBox);
