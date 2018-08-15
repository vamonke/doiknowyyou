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
        seconds: 0
      })
      clearInterval(this.interval);
      this.props.startGame();
    }
  }

  render() {
    return (
      <div className="countdownText">
        {this.state.seconds === 0 ? "Let's go" : (
          'Game starts in ' + this.state.seconds
        )}
      </div>
    );
  }
}

Countdown.propTypes = {
  gameId: PropTypes.string,
  startGame: PropTypes.func,
};

Countdown.defaultProps = {
  gameId: null,
  startGame: () => null,
}
