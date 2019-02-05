import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Modal, ModalBody, FormField, FormInput, Glyph } from 'elemental';

export default class createGame extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      disabled: false,
      errorMsg: ''
    };
    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleBack = this.handleBack.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleNameChange(e) {
    this.setState({
      name: e.target.value,
    });
  }

  handleBack() {
    this.setState({
      name: '',
      disabled: false,
      errorMsg: ''
    });
    this.props.showHome();
  }

  async handleSubmit(event) {
    event.preventDefault();
    this.setState({ disabled: true, errorMsg: '' });
    try {
      const { name } = this.state;
      if (!name) throw Error('Name cannot be empty');
      await this.props.createGame(name);
    } catch (error) {
      const errorMsg = error.reason || error.message;
      this.setState({ disabled: false, errorMsg });
    }
  }

  render() {
    return (
      <Modal className="center" isOpen={this.props.modalIsOpen} width={500} backdropClosesModal>
        <ModalBody>
          <form onSubmit={this.handleSubmit}>
            <FormField>
              <FormInput onChange={this.handleNameChange} placeholder="Enter your name" type="text" autoFocus />
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
                  type="submit"
                  className="redButton"
                  disabled={this.state.disabled}
                >
                  Create
                </button>
              </Col>
            </Row>
          </form>
        </ModalBody>
      </Modal>
    );
  }
}
