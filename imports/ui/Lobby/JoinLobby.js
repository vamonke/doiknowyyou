import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormField, FormInput, Glyph } from 'elemental';

import { Meteor } from 'meteor/meteor';

export default class JoinLobby extends Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.state = {
      playerName: '',
      disabled: false,
      errorMsg: ''
    };
  }

  handleChange(event) {
    const playerName = event.target.value;
    this.setState({ playerName, errorMsg: '' });
  }

  async handleSubmit(event) {
    event.preventDefault();
    this.setState({ disabled: true, errorMsg: '' });
    try {
      const { playerName } = this.state;
      if (!playerName) throw Error('Name cannot be empty');

      const gameId = this.props.game._id;
      Meteor.call('players.insert', playerName, gameId, null, (error, player) => {
        if (error) {
          throw error;
        }
        if (player && player.gameId) {
          Session.setPersistent('currentUserId', player._id);
        }
      });
    } catch (error) {
      const errorMsg = error.reason || error.message;
      this.setState({ disabled: false, errorMsg });
    }
  }

  render() {
    const { playerName } = this.state;
    const { code } = this.props.game;
    return (
      <div>
        <div className="header">
          do i know you?
        </div>
        <div className="center paddingBottom">
          {'Game Code: '}
          <strong>{code}</strong>
        </div>
        <div className="card">
          <form onSubmit={this.handleSubmit}>
            <FormField>
              <FormInput
                value={playerName}
                onChange={this.handleChange}
                type="text"
                placeholder="Enter your name"
                autoFocus
              />
            </FormField>
            {this.state.errorMsg && (
              <div className="errorMsg center">
                <Glyph icon="alert" />
                {' '}
                {this.state.errorMsg}
              </div>
            )}
            <button
              type="submit"
              className="greenButton"
              disabled={this.state.disabled}
            >
              Join Game
            </button>
          </form>
        </div>
        <div className="center">
          <a href="/">Home</a>
        </div>
      </div>
    );
  }
}

JoinLobby.propTypes = {
  game: PropTypes.shape({
    _id: PropTypes.string,
    code: PropTypes.number,
  }),
};

JoinLobby.defaultProps = {
  game: {
    code: null,
    _id: null,
  }
};
