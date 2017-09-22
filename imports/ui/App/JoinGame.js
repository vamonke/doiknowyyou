import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { createContainer } from 'meteor/react-meteor-data';

import { Card, Row, Col, Modal, ModalHeader, ModalBody, FormField, FormInput } from 'elemental';
import { Link } from 'react-router-dom';

import { Games } from '../../api/games.js';
import { Players } from '../../api/players.js';

import './App.css';

export default class joinGame extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      code: ''
    }
    this.handleClick = this.handleClick.bind(this);
    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleCodeChange = this.handleCodeChange.bind(this);
  }

  handleNameChange(e) {
    this.setState({
      name: e.target.value
    });
  }

  handleCodeChange(e) {
    this.setState({
      code: e.target.value
    });
  }

  handleClick() {
    this.props.addPlayer(this.state.code, this.state.name);
  }

  render() {
    return (
      <Modal className="center" isOpen={this.props.modalIsOpen} width={500} backdropClosesModal>
        <ModalBody>
          <div className="paddingTop">
            <FormField>
              <FormInput onChange={this.handleNameChange} placeholder="Enter your name" type="text" autoFocus />
            </FormField>
            <FormField>
              <FormInput onChange={this.handleCodeChange} placeholder="Enter the 4-digit game code" type="text" />
            </FormField>
            <Row>
              <Col xs="1/2">
                <button className="whiteButton" onClick={this.props.showHome}>
                  Back
                </button>
              </Col>
              <Col xs="1/2">
                <button className="greenButton" onClick={this.handleClick}>
                  Join
                </button>
              </Col>
            </Row>
          </div>
        </ModalBody>
      </Modal>
    );
  }
}
