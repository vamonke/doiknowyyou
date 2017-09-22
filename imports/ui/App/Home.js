import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Card, Row, Col } from 'elemental';

import styles from './App.css';

export default function Home(props) {
  return (
    <div>
      <div className="logo">
        Do I
        <br />
        Know
        <br />
        You?
      </div>
      <Row className="buttonsWrap">
        <Col sm="1/2">
          <button className="redButton marginTopBottom" onClick={props.showCreateGame} type="success">
            New Game
          </button>
        </Col>
        <Col sm="1/2">
          <button className="greenButton marginTopBottom" onClick={props.showJoinGame} type="primary">
            Join Game
          </button>
        </Col>
      </Row>
      <div className="heading">How to play</div>
      Before starting the game, every player will write down questions to add to the question pool. Once all players are ready, the game begins and the starting player is randomly selected.
      <br />
      <br />
      In each player's turn, he/she will randomly draw a question and answer it in secret. Other players will try to guess his\her answer. Players who guess the answer correctly are rewarded 1 point and the rest get no points.
      <br />
      <br />
      Questions will not be repeated and the game ends when the question pool is empty. The player with the highest points at the end of the game is the winner.
    </div>
  );
}