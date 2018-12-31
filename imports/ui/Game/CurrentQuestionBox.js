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
    const { question, recipient, viewer } = this.props;
    const { selected } = this.state;
    const multiline = question.options.length > 2
      || question.options.some(option => option.length > 26);
    const buttonWidth = multiline ? '100%' : '50%';
    return (
      <div className="card center lessBottomPadding">
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
          />
        ) : (
          // Close-ended question
          <div>
            <div className="marginBottom">
              {(recipient._id !== viewer._id) && (
                `Guess ${recipient.name}'s answer`
              )}
            </div>
            <Row>
              {question.options.map((option, index) => (
                <Col xs={buttonWidth} key={index} className="paddingBottom">
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
              <div id="honestly">(Answer honestly and let the other players guess your answer)</div>
            )}
          </div>
        )}
      </div>
    );
  }
}

CurrentQuestionBox.propTypes = {
  recipient: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }),
  question: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    options: PropTypes.array.isRequired,
  }),
  viewer: PropTypes.shape({
    _id: PropTypes.string.isRequired,
  }),
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
};

export default createContainer(props => props, CurrentQuestionBox);
