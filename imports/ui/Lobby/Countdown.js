import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class Countdown extends Component {
  constructor(props) {
    super(props);
    this.state =({
      seconds: 3
    });
    this.countDown = this.countDown.bind(this);
  }

  componentDidMount() {
    this.interval = setInterval(this.countDown, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  countDown() {
    let seconds = this.state.seconds - 1;
    if (seconds >= 1) {
      this.setState({
        seconds: seconds
      })
    } else {
      this.setState({
        seconds: "Let's go"
      })
      clearInterval(this.interval);
      this.props.startGame();
    }
  }

  startGame() {
    let code = this.props.gameCode;
    Meteor.call('games.start', code);
    this.props.history.push(`/game/${code}`);
  }

  render() {
    return (
      <span>
        {this.state.seconds}
      </span>
    );
  }
}

Countdown.propTypes = {
  gameCode: PropTypes.number,
  startGame: PropTypes.func,
};
 
Countdown.defaultProps = {
  gameCode: null,
  startGame: () => null,
}
