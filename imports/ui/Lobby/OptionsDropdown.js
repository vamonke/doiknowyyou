import React, { Component } from 'react';
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types';

import { Glyph } from 'elemental';

export default class OptionsDropdown extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.toggle = this.toggle.bind(this);
    this.open = this.open.bind(this);
    this.close = this.close.bind(this);
    this.state = { show: false };
  }

  toggle() {
    this.setState({ show: !this.state.show })
  }

  open() {
    this.setState({ show: true })
  }

  close() {
    this.setState({ show: false })
  }

  handleChange(value) {
    this.props.onSelect(value);
    this.close();
  }

  render() {
    let optionTypes = ['True/False', 'Yes/No', 'Players']
    return (
      <div className="dropdownContainer">
        Options
        <button className="optionsButton" onClick={this.toggle}>
          <Glyph icon={this.state.show ? "chevron-up" : "chevron-down"} />
        </button>
        <div className={`optionsDropdown center ${this.state.show && 'show'}`}>
          {
            optionTypes.map((type, index) => (
              <div key={index} onClick={() => this.handleChange(index)}>
                {type}
              </div>
            ))
          }
        </div>
      </div>
    );
  }
}

// QuestionSet.propTypes = {
//   questionNo: PropTypes.number.isRequired,
//   changeQuestion: PropTypes.func.isRequired
// };
//
// QuestionSet.defaultProps = {
//   questionNo: 0,
//   changeQuestion: () => null
// }
