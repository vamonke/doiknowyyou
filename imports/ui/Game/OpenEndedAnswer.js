import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { createContainer } from 'meteor/react-meteor-data';
import { FormInput } from 'elemental';

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
    this.submit = this.submit.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
    this.answer = this.answer.bind(this);
    this.renderOptions = this.renderOptions.bind(this);
    this.state = {
      submission: '',
      correct: [],
      submitted: false,
    }
  }

  componentWillReceiveProps(newProps) { // Reset state on question change
    if (newProps.question._id != this.props.question._id)
      this.setState({
        submission: '',
        correct: [],
        submitted: false,
      });
  }

  handleChange(event) {
    this.setState({ submission: event.target.value });
  }

  submit() {
    Meteor.call('answers.insertOpen',
      this.props.question.gameId,
      this.props.question._id,
      this.props.viewerId,
      this.state.submission
    );
    this.setState({ submitted: true });
  }

  handleSelect(event) {
    let selected = event.target.name;
    addOrRemove(this.state.correct, selected);
    this.setState({ correct: this.state.correct });
  }

  answer() {
    Meteor.call('answers.insert',
      this.props.question.gameId,
      this.props.question._id,
      this.props.viewerId,
      this.state.correct
    );
  }

  guesser() {
    if (this.state.submitted)
      return (<div>Waiting for other players</div>);
    return (
      <div>
        <div className="marginBottom">
          Guess {this.props.recipientName}'s answer
        </div>
        <FormInput placeholder='Your guess' onChange={this.handleChange} />
        <div className="paddingBottom" />
        <button className='blueButton' onClick={this.submit}>
          Submit
        </button>
      </div>
    );
  }

  renderOptions(option, index) {
    return (
      <div key={index} className="paddingBottom">
        <button name={index} className='whiteButton' onClick={this.handleSelect}>
          {option}
        </button>
      </div>
    );
  }

  render() {
    if (this.props.question.recipientId != this.props.viewerId) // Guessing
      return this.guesser();
    if (this.props.question.options.length === 0) // Waiting for options
      return (<div>Waiting for other players to guess</div>);
    // Options available
    return (
      <div>
        <div className="marginBottom">
          Pick the best guess(es)
        </div>
        {this.props.question.options.map(this.renderOptions)}
        <button className='blueButton' onClick={this.answer}>
          Submit
        </button>
      </div>
    );
  }
}

OpenEndedAnswer.propTypes = {
  question: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    recipientId: PropTypes.string.isRequired,
    options: PropTypes.array
  }),
  viewerId: PropTypes.string.isRequired,
};

OpenEndedAnswer.defaultProps = {
  question: {
    _id: '',
    recipientId: '',
    options: []
  },
  viewerId: '',
}

export default createContainer(props => props, OpenEndedAnswer);
