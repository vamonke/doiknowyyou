import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormInput, Glyph, Row, Col } from 'elemental';

import OptionsDropdown from './OptionsDropdown';
import { questionBank } from './questionBank';

// Lobby question and options component
export default class QuestionSet extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.nextQuestion = this.nextQuestion.bind(this);
    this.prevQuestion = this.prevQuestion.bind(this);
    this.addOption = this.addOption.bind(this);
    this.removeOption = this.removeOption.bind(this);
    this.optionField = this.optionField.bind(this);
    this.renderButtons = this.renderButtons.bind(this);
    this.setOptionType = this.setOptionType.bind(this);
    this.generateQuestion = this.generateQuestion.bind(this);
    this.state = {
      question: '',
      format: 'mcq',
      options: ['', '']
    };
  }

  setOptionType(type) {
    let options = [];
    let format;
    if (type === 0) { // True/False
      format = 'mcq';
      options = ['True', 'False'];
    } else if (type === 1) { // Yes/No
      format = 'mcq';
      options = ['Yes', 'No'];
    } else if (type === 2) { // Players
      format = 'players';
      options = [];
    } else if (type === 3) { // Custom
      format = 'mcq';
      options = ['', ''];
    } else if (type === 4) { // Open-Ended
      format = 'open';
      options = [];
    }
    this.setState({ format, options });
  }

  optionField(_, optionNo) {
    return (
      <div key={optionNo} className="paddingBottom">
        <FormInput
          placeholder={`Option  ${optionNo + 1}`}
          value={this.state.options[optionNo]}
          name={optionNo.toString()}
          onChange={this.handleChange}
        />
      </div>
    );
  }

  prevQuestion() {
    this.props.changeQuestion(this.props.questionNo, this.state, false);
  }

  nextQuestion() {
    const qna = {
      question: this.state.question,
      format: this.state.format,
      options: this.state.options.filter(String)
    };
    this.props.changeQuestion(this.props.questionNo, qna, true);
  }

  handleChange(event) {
    const field = event.target.name;
    const { value } = event.target;
    if (field === 'question') {
      this.setState({ question: value });
    } else {
      const { options } = this.state;
      options[field] = value;
      this.setState({ options: options });
    }
  }

  addOption() {
    this.setState({
      options: this.state.options.concat([''])
    });
  }

  removeOption() {
    this.state.options.pop();
    this.setState({
      options: this.state.options
    });
  }

  generateQuestion() {
    const qna = questionBank[Math.floor(Math.random() * questionBank.length)];
    if (Array.isArray(qna.options)) {
      qna.format = 'mcq';
      this.setState(qna);
    } else if (qna.options === 'players') {
      this.setState({
        question: qna.question,
        format: 'players',
        options: []
      });
    } else if (qna.options === 'open') {
      this.setState({
        question: qna.question,
        format: 'open',
        options: []
      });
    }
  }

  renderButtons() {
    const { questionNo } = this.props;
    if (questionNo === 0) {
      return (
        <button type="button" className="greenButton" onClick={this.nextQuestion}>
          {'Next '}
          <Glyph icon="chevron-right" />
        </button>
      );
    } else if (questionNo === 2) {
      return (
        <Row>
          <Col xs="1/2">
            <button type="button" className="whiteButton" onClick={this.prevQuestion}>
              <Glyph icon="chevron-left" />
              {' Previous'}
            </button>
          </Col>
          <Col xs="1/2">
            <button type="button" className="greenButton" onClick={this.nextQuestion}>
              {'Ready ' }
              <Glyph icon="check" />
            </button>
          </Col>
        </Row>
      );
    }
    return (
      <Row>
        <Col xs="1/2">
          <button type="button" className="whiteButton" onClick={this.prevQuestion}>
            <Glyph icon="chevron-left" />
            {' Previous'}
          </button>
        </Col>
        <Col xs="1/2">
          <button type="button" className="greenButton" onClick={this.nextQuestion}>
            {'Next '}
            <Glyph icon="chevron-right" />
          </button>
        </Col>
      </Row>
    );
  }

  render() {
    return (
      <div style={{ display: (this.props.display ? 'block' : 'none') }}>
        <div className="paddingBottom">
          <b>{`Question ${this.props.questionNo + 1} of 3`}</b>
        </div>
        <button type="button" onClick={this.generateQuestion} id="random">
          Random
        </button>
        <FormInput
          placeholder="Write a question to ask other players"
          name="question"
          value={this.state.question}
          onChange={this.handleChange}
          autoFocus={this.props.display}
          multiline
        />

        <div className="paddingTop paddingBottom">
          <OptionsDropdown onSelect={this.setOptionType} />
        </div>

        {this.state.format === 'open' && (
          <div className="paddingBottom">
            <FormInput placeholder="Open-ended (best answer selected)" disabled />
          </div>
        )}
        {this.state.format === 'players' && (
          <div className="paddingBottom">
            <FormInput placeholder="Players" disabled />
          </div>
        )}

        {this.state.options.map(this.optionField)}

        {this.state.format === 'mcq' && (
          <div className="center">
            <button type="button" className="addOption" onClick={this.addOption}>
              <Glyph icon="plus" />
              {' Add option'}
            </button>
            {this.state.options.length > 2 && (
              <button type="button" className="addOption" onClick={this.removeOption}>
                <Glyph icon="dash" />
                {' Remove option'}
              </button>
            )}
          </div>
        )}

        <hr className="noTop" />

        {this.renderButtons()}
      </div>
    );
  }
}

QuestionSet.propTypes = {
  questionNo: PropTypes.number.isRequired,
  changeQuestion: PropTypes.func.isRequired,
  display: PropTypes.bool.isRequired,
};
