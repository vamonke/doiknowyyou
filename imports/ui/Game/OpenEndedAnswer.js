import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { createContainer } from 'meteor/react-meteor-data';
import { FormInput } from 'elemental';

import './OpenEndedAnswer.css';

function addOrRemove(array, value) {
  const index = array.indexOf(value);
  if (index === -1) {
    array.push(value);
  } else {
    array.splice(index, 1);
  }
}

class OpenEndedAnswer extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
    this.answer = this.answer.bind(this);
    this.renderOptions = this.renderOptions.bind(this);
    this.state = {
      submission: '',
      correct: [],
      submitted: false,
    };
  }

  componentWillReceiveProps(newProps) { // Reset state on question change
    if (newProps.question._id !== this.props.question._id) {
      this.setState({
        submission: '',
        correct: [],
        submitted: false,
      });
    }
  }

  handleChange(event) {
    this.setState({ submission: event.target.value });
  }

  handleSubmit(event) {
    event.preventDefault();
    Meteor.call('answers.insertOpen',
      this.props.question.gameId,
      this.props.question._id,
      this.props.viewerId,
      this.state.submission);
    this.setState({ submitted: true });
  }

  handleSelect(event) {
    const selected = event.target.name;
    addOrRemove(this.state.correct, selected);
    this.setState({ correct: this.state.correct });
  }

  answer() {
    Meteor.call('answers.insert',
      this.props.question.gameId,
      this.props.question._id,
      this.props.viewerId,
      this.state.correct);
  }

  guesser() {
    if (this.state.submitted) {
      let waitingMsg = 'Waiting for other players';
      if (this.props.question.options.length >= this.props.playerCount - 1) { // Waiting for options
        waitingMsg = 'Waiting for ' + this.props.recipientName;
      }
      return (
        <div>
          <i>{waitingMsg}</i>
          <hr />
          {'Answers: '}
          {this.props.question.options.map(option => (
            <div className="openEndedGuess">{option}</div>
          ))}
        </div>
      );
    }
    return (
      <form onSubmit={this.handleSubmit}>
        <div className="marginBottom">
          {`Guess ${this.props.recipientName}'s answer`}
        </div>
        <FormInput placeholder="Your guess" onChange={this.handleChange} />
        <div className="paddingBottom" />
        <button type="submit" className="blueButton">
          Submit
        </button>
      </form>
    );
  }

  renderOptions(option, index) {
    const className = this.state.correct.includes(index + '') ? ' selected' : '';
    return (
      <button
        type="button"
        name={index}
        key={index}
        className={'whiteButton option' + className}
        onClick={this.handleSelect}
      >
        {option}
      </button>
    );
  }

  render() {
    if (this.props.question.recipientId !== this.props.viewerId) { // Guessing
      return this.guesser();
    }
    if (this.props.question.options.length < this.props.playerCount - 1) { // Waiting for options
      return (<i>Waiting for other players to guess</i>);
    }
    // Options available
    return (
      <div>
        <div>
          Pick the best guess(es)
        </div>
        {this.props.question.options.map(this.renderOptions)}
        <hr />
        <button type="button" className="blueButton" onClick={this.answer} disabled={this.state.correct.length === 0}>
          Submit
        </button>
      </div>
    );
  }
}

OpenEndedAnswer.propTypes = {
  question: PropTypes.shape({
    _id: PropTypes.string,
    recipientId: PropTypes.string,
    options: PropTypes.array,
    gameId: PropTypes.string,
  }),
  recipientName: PropTypes.string,
  viewerId: PropTypes.string,
  playerCount: PropTypes.number,
};

OpenEndedAnswer.defaultProps = {
  question: {
    _id: '',
    recipientId: '',
    options: [],
    gameId: ''
  },
  recipientName: '',
  viewerId: '',
  playerCount: 100,
};

export default createContainer(props => props, OpenEndedAnswer);
