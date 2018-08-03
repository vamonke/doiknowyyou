import React, { Component } from 'react';
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types';
import { FormField, FormInput, Button, Glyph, Row, Col } from 'elemental';

// Lobby question and options component
export default class QuestionSet extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.nextQuestion = this.nextQuestion.bind(this);
    this.prevQuestion = this.prevQuestion.bind(this);
    this.addOption = this.addOption.bind(this);
    this.optionField = this.optionField.bind(this);
    this.state = {
      question: '',
      options: ['', '']
    };
  }

  addOption() {
   this.setState({
     options: this.state.options.concat([''])
   });
  }

  handleChange(event) {
    const field = event.target.name;
    const value = event.target.value;
    if (field == 'question') {
      this.setState({ question: value })
    } else {
      let options = this.state.options;
      options[field] = value;
      this.setState({ options: options });
    }
  }

  nextQuestion() {
    this.props.changeQuestion(this.props.questionNo, this.state, true);
  }

  prevQuestion() {
    this.props.changeQuestion(this.props.questionNo, this.state, false);
  }

  optionField(value, optionNo) {
    return (
      <div key={optionNo} className="paddingBottom">
        <FormInput
          placeholder={'Option ' + (optionNo + 1)}
          name={optionNo.toString()}
          onChange={this.handleChange}
        />
      </div>
    );
  }

  render() {
    return (
      <div>
        <FormInput
          placeholder={"Question " + (this.props.questionNo + 1)}
          name="question"
          onChange={this.handleChange}
          autoFocus
        />

        <div className="center paddingBottom paddingTop">
          Options
        </div>
        {this.state.options.map(this.optionField)}

        <button className="addOption" onClick={this.addOption}>
          <Glyph icon="plus" className="circle"/>
          {' Add option'}
        </button>

        <Row>
          <Col sm="1/2">
            {this.props.questionNo !== 0 && (
              <button className="whiteButton" onClick={this.prevQuestion}>
                <Glyph icon="chevron-left" />
                {' Previous'}
              </button>
            )}
        	</Col>
          <Col sm="1/2">
            <button className="greenButton" onClick={this.nextQuestion}>
            {this.props.questionNo === 2 ? 'Ready ' : 'Next '}
            {this.props.questionNo === 2 ? (<Glyph icon="check" />) : (<Glyph icon="chevron-right" />)}
            </button>
        	</Col>
        </Row>
      </div>
    );
  }
}

QuestionSet.propTypes = {
  questionNo: PropTypes.number.isRequired,
  changeQuestion: PropTypes.func.isRequired
};

QuestionSet.defaultProps = {
  questionNo: 0,
  changeQuestion: () => null
}
