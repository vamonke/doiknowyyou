import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { createContainer } from 'meteor/react-meteor-data';
import { Glyph } from 'elemental';

import './GameOver.css';

class GameOver extends Component {
  constructor(props) {
    super(props);
    this.close = this.close.bind(this);
    this.state = { open: true }
  }

  close() {
    this.setState({ open: false })
  }

  render() {
    if (!this.props.open || !this.state.open)
      return null;
    const highscore = this.props.players[0].score;
    let winners = this.props.players
      .filter(player => player.score === highscore)
      .map(player => player.name);
    winnerString = [winners.slice(0, -1).join(', '), winners.slice(-1)[0]].join(winners.length < 2 ? '' : ' & ');
    return (
      <div className="center gameover">
        <h3>game over</h3>
        <div className="pad">
          <h1>
            {winnerString}
          </h1>
          {winners.length === 1 ? ' wins ' : ' win '}
          the game!
        </div>
        <div className="close" onClick={this.close}>
          <Glyph icon="x"/>
          {'  '}
          Close
        </div>
      </div>
    );
  }
}

GameOver.propTypes = {
  players: PropTypes.array,
};

GameOver.defaultProps = {
  players: [{
    score: 0
  }]
}

export default createContainer(props => props, GameOver);