import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Row, Col, Modal, ModalBody, FormField, FormInput, Glyph } from 'elemental';

import './App.css';

export default class joinGame extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      code: '',
      disabled: false,
      errorMsg: ''
    };
    this.handleBack = this.handleBack.bind(this);
    this.handleJoin = this.handleJoin.bind(this);
    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleCodeChange = this.handleCodeChange.bind(this);
  }

  handleNameChange(e) {
    this.setState({
      name: e.target.value,
    });
  }

  handleCodeChange(e) {
    this.setState({
      code: Number(e.target.value),
    });
  }

  handleBack() {
    this.setState({ disabled: false, errorMsg: '' });
    this.props.showHome();
  }

  async handleJoin() {
    this.setState({ disabled: true, errorMsg: '' });
    try {
      const { name, code } = this.state;
      if (!name && !code) throw Error('Name and game code cannot be empty');
      if (!name) throw Error('Name cannot be empty');
      if (!code) throw Error('Game code cannot be empty');
      await this.props.addPlayer(name, null, code);
    } catch (error) {
      const errorMsg = error.reason || error.message;
      this.setState({ disabled: false, errorMsg });
    }
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
            {this.state.errorMsg && (
              <div className="errorMsg">
                <Glyph icon="alert" />
                {' '}
                {this.state.errorMsg}
              </div>
            )}
            <Row>
              <Col xs="1/2">
                <button type="button" className="whiteButton" onClick={this.handleBack}>
                  Back
                </button>
              </Col>
              <Col xs="1/2">
                <button
                  type="button"
                  className="greenButton"
                  onClick={this.handleJoin}
                  disabled={this.state.disabled}
                >
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
