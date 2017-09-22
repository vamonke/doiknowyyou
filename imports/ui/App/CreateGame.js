import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Card, Row, Col, Modal, ModalHeader, ModalBody, FormField, FormInput } from 'elemental';

import { Games } from '../../api/games.js';

import styles from './App.css';

export default class createGame extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: ''
    }
    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  handleNameChange(e) {
    this.setState({
      name: e.target.value
    });
  }

  handleClick() {
    this.props.createGame(this.state.code, this.state.name);
  }

  render() {
    return (
      <Modal className="center" isOpen={this.props.modalIsOpen} width={500} backdropClosesModal>
        <ModalBody>
          <div className="paddingTop">
            <FormField>
              <FormInput onChange={this.handleNameChange} placeholder="Enter your name" type="text" autoFocus />
            </FormField>
            <Row>
              <Col xs="1/2">
                <button className="whiteButton" onClick={this.props.showHome}>
                  Back
                </button>
              </Col>
              <Col xs="1/2">
                <button className="redButton" onClick={this.handleClick}>
                  Create
                </button>
              </Col>
            </Row>
          </div>
        </ModalBody>
      </Modal>
    );
  }
}
