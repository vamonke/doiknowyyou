import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class OptionsDropdown extends Component {
  constructor(props) {
    super(props);
    this.handleSelect = this.handleSelect.bind(this);
  }

  handleSelect(event) {
    this.props.onSelect(Number(event.target.value));
  }

  render() {
    const { format, options } = this.props;
    let defaultValue = '0';

    if (format === 'mcq') {
      if (options.includes('Yes', 'No')) {
        defaultValue = '1';
      } else if (options.includes('Yes', 'No')) {
        defaultValue = '2';
      }
    } else if (format === 'players') {
      defaultValue = '3';
    } else if (format === 'open') {
      defaultValue = '4';
    }

    return (
      <div className="dropdownContainer">
        <span className="optionsLabel">Options</span>
        <select className="floatRight selectType" value={defaultValue} onChange={this.handleSelect}>
          <option value="-1" disabled hidden>Type</option>
          <option value="0">Custom</option>
          <option value="1">Yes/No</option>
          <option value="2">True/False</option>
          <option value="3">Players</option>
          <option value="4">Open-ended</option>
        </select>
      </div>
    );
  }
}

OptionsDropdown.propTypes = {
  onSelect: PropTypes.func.isRequired,
  format: PropTypes.string.isRequired,
};
