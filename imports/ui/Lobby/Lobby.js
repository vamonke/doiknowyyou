import React, { Component } from 'react';
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types';
import { createContainer } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Table, Card, FormField, FormInput, Button, Spinner, Glyph } from 'elemental';

import { Games } from '../../api/games.js';
import { Players } from '../../api/players.js';
import { Questions } from '../../api/questions.js';

import './Lobby.css';

// Game lobby component
class Lobby extends Component {
  constructor(props) {
    super(props);
    this.addQuestions = this.addQuestions.bind(this);
    this.editQuestions = this.editQuestions.bind(this);
    this.startGame = this.startGame.bind(this);
  }

  componentDidUpdate() {
    document.title = `DIKY: Game ${this.props.game.code}`;
  }

  addQuestions() {
    let q1 = ReactDOM.findDOMNode(this.q1).value.trim();
    let q2 = ReactDOM.findDOMNode(this.q2).value.trim();
    let q3 = ReactDOM.findDOMNode(this.q3).value.trim();
    let gameCode = this.props.game.code;
    let playerId = Session.get('currentUserId');
    let qna = [
      {
        question: q1,
        options: [true, false]
      },
      {
        question: q2,
        options: [true, false]
      },
      {
        question: q3,
        options: [true, false]
      },
    ];
    Meteor.call('questions.insert', gameCode, playerId, qna);
    Meteor.call('players.ready', playerId);
    this.setState({
      editable: false
    });
  }

  editQuestions() {
    let playerId = Session.get('currentUserId');
    Meteor.call('players.unReady', playerId);
  }

  renderPlayers() {
    return this.props.players.map((player) => {
      let playerName = (player._id === this.props.viewer._id) ? (<strong>{player.name}</strong>) : player.name;
      return (
        <tr key={player._id}>
          <td>
            {playerName}
          </td>
          <td>
            {
              player.isReady ?
              <div className="ready">Ready</div>
              : 
              '-'
            }
          </td>
        </tr>
      )
    });
  }

  displayStartButton() {
    let ready = (this.props.viewer && !this.props.viewer.isReady) ? null : "appear";
    let players = this.props.players;
    let gameStatus = (
      <div className={`center popDown ${ready}`}>
        <Spinner type="primary" className="paddingRight"/>
        {' '}
        Waiting for players to get ready
      </div>
    );
    for (let i = 0; i < players.length; i += 1) {
      if (!players[i].isReady) {
        return gameStatus;
      }
    };
    return (
      <div className={`center popDown ${ready}`}>
        Start game
      </div>
    );
  }

  startGame() {
    let code = this.props.game.code;
    Meteor.call('games.start', code);
    this.props.history.push(`/game/${code}`);
  }

  render() {
    return (
      <div>
        <div className="center relative">
          Game Code:
          {' '}
          <strong>
            {this.props.game.code}
          </strong>
          <Button type="link" className="absoluteRight">
            <Glyph icon="link" />
          </Button>
        </div>
        <div className="header">
          your questions
        </div>
        <div className="card">
          <div className="center paddingBottom">
            Add questions to ask other players
          </div>
          <FormField>
            <FormInput
              ref={(input) => { this.q1 = input; }}
              disabled={this.props.viewer.isReady}
              placeholder="Question 1"
              autoFocus
            />
          </FormField>
          <FormField>
            <FormInput
              ref={(input) => { this.q2 = input; }}
              disabled={this.props.viewer.isReady}
              placeholder="Question 2"
            />
          </FormField>
          <FormField>
            <FormInput
              ref={(input) => { this.q3 = input; }}
              disabled={this.props.viewer.isReady}
              placeholder="Question 3"
            />
          </FormField>  
          {(this.props.viewer.isReady) ? (
            <button className="whiteButton" onClick={this.editQuestions} type="link" block>
              Edit questions
            </button>
          ) : (
            <button className="greenButton" onClick={this.addQuestions} type="primary" block>
              Ready
            </button>
          )}
        </div>
        {this.displayStartButton()}
        
        <div className="header">
          players
        </div>
        <div className="card">
          <Table className="reduceTop">
            <colgroup>
              <col width="" />
              <col width="80" />
            </colgroup>
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {this.renderPlayers()}
            </tbody>
          </Table>
          <div className="center borderTop">
            <Button type="hollow-primary" size="sm">
              <Glyph icon="plus" className="plusIcon" />
              {' '}
              Invite friends
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

Lobby.propTypes = {
  players: PropTypes.array.isRequired,
  game: PropTypes.shape({
    code: PropTypes.number,
  })
};
 
Lobby.defaultProps = {
  game: {
    code: null
  },
  viewer: {
    isReady: false
  }
}

export default createContainer((value) => {
  let code = Number(value.match.params.code);
  Meteor.subscribe('games');
  Meteor.subscribe('players');
  Meteor.subscribe('questions');
  return {
    game: Games.findOne({ code: code }),
    players: Players.find({ gameCode: code }).fetch(),
    questions: Questions.find({ gameCode: code }).fetch(),
    viewer: Players.findOne({ _id: Session.get('currentUserId') }),
  };
}, Lobby);
