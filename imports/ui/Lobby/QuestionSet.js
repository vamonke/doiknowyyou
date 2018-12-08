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
    this.optionField = this.optionField.bind(this);
    this.renderButtons = this.renderButtons.bind(this);
    this.setOptionType = this.setOptionType.bind(this);
    this.generateQuestion = this.generateQuestion.bind(this);
    this.state = {
      question: '',
      format: '',
      options: ['', '']
    };
  }

  generateQuestion() {
    let qna = questionBank[Math.floor(Math.random() * questionBank.length)];
    if (Array.isArray(qna.options)) {
      qna.format = 'mcq';
      this.setState(qna);
    } else if (qna.options == 'players') {
      this.setState({
        question: qna.question,
        format: 'players',
        options: []
      });
    }
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
    let qna = {
      question: this.state.question,
      format: this.state.format,
      options: this.state.options.filter(String)
    }
    this.props.changeQuestion(this.props.questionNo, qna, true);
  }

  prevQuestion() {
    this.props.changeQuestion(this.props.questionNo, this.state, false);
  }

  optionField(_, optionNo) {
    return (
      <div key={optionNo} className="paddingBottom">
        <FormInput
          placeholder={'Option ' + (optionNo + 1)}
          value={this.state.options[optionNo]}
          name={optionNo.toString()}
          onChange={this.handleChange}
        />
      </div>
    );
  }

  setOptionType(type) {
    let options = [];
    if (type === 0) {
      format = 'mcq';
      options = ['True', 'False'];
    } else if (type === 1) {
      format = 'mcq';
      options = ['Yes', 'No'];
    } else if (type === 2) {
      format = 'players';
      options = [];
    } else if (type === 3) {
      format = 'ssm';
      options = ['','',''];
    } else if (type === 4) {
      format = 'mcq';
      options = ['',''];
    } else if (type === 5) {
      format = 'open';
      options = [];
    }
    this.setState({ format, options })
  }

  renderButtons() {
    let questionNo = this.props.questionNo;
    if (questionNo === 0) {
      return (
        <button className="greenButton" onClick={this.nextQuestion}>
          {'Next '}
          <Glyph icon="chevron-right" />
        </button>
      );
    } else if (questionNo === 2) {
      return (
        <Row>
          <Col xs="1/2">
            <button className="whiteButton" onClick={this.prevQuestion}>
              <Glyph icon="chevron-left" />
              {' Previous'}
            </button>
          </Col>
          <Col xs="1/2">
            <button className="greenButton" onClick={this.nextQuestion}>
              {'Ready ' }
              <Glyph icon="check" />
            </button>
          </Col>
        </Row>
      );
    } else {
      return (
        <Row>
          <Col xs="1/2">
            <button className="whiteButton" onClick={this.prevQuestion}>
              <Glyph icon="chevron-left" />
              {' Previous'}
            </button>
          </Col>
          <Col xs="1/2">
            <button className="greenButton" onClick={this.nextQuestion}>
            {'Next '}
            <Glyph icon="chevron-right" />
            </button>
          </Col>
        </Row>
      );
    }
  }

  render() {
    return (
      <div style={{display: (this.props.display ? 'block' : 'none')}}>
        <div className="paddingBottom">
          <b>{'Question ' + (this.props.questionNo + 1) + ' of 3'}</b>
        </div>
        <button onClick={this.generateQuestion} className="generateButton">
          Randomize
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
        

        {this.state.format == 'open' && (
          <div className="paddingBottom">
            <FormInput placeholder='Open-ended (Best answer wins)' disabled/>
          </div>
        )}
        {this.state.format == 'players' && (
          <div className="paddingBottom">          
            <FormInput placeholder='Players as options (excluding answering player)' disabled/>
          </div>
        )}
        
        {this.state.options.map(this.optionField)}

        {this.state.format == 'mcq' && (
          <button className="addOption" onClick={this.addOption}>
            <Glyph icon="plus" className="circle"/>
            {' Add option'}
          </button>
        )}

        {this.renderButtons()}
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
