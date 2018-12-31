import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormInput, Glyph } from 'elemental';

import { Meteor } from 'meteor/meteor';

export default class EditName extends Component {
  constructor(props) {
    super(props);
    this.submit = this.submit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.toggle = this.toggle.bind(this);
    this.cancel = this.cancel.bind(this);
    this.state = {
      edit: false,
      newName: '',
    };
  }

  submit() {
    const { newName } = this.state;
    const { viewer: { _id } } = this.props;
    Meteor.call('players.rename', _id, newName);
    this.toggle();
  }

  handleChange(event) {
    const newName = event.target.value;
    this.setState({ newName });
  }

  toggle() {
    const { edit } = this.state;
    this.setState({ edit: !edit });
  }

  cancel() {
    this.setState({ newName: '' });
    this.toggle();
  }

  render() {
    const { edit, newName } = this.state;
    const { viewer } = this.props;
    if (edit) {
      return (
        <form className="editName">
          <FormInput
            className="newName"
            value={newName}
            onChange={this.handleChange}
            autoFocus
          />
          <button type="submit" className="check" onClick={this.submit}>
            <Glyph icon="check" />
          </button>
          <button type="button" className="cancel" onClick={this.cancel}>
            <Glyph icon="x" />
          </button>
        </form>
      );
    }
    return (
      <div className="editName">
        <strong>{viewer.name}</strong>
        <button type="button" className="edit" onClick={this.toggle}>
          <Glyph icon="pencil" />
        </button>
      </div>
    );
  }
}

EditName.propTypes = {
  viewer: PropTypes.shape({
    name: PropTypes.string,
  }),
};

EditName.defaultProps = {
  viewer: {
    name: '',
  },
};
