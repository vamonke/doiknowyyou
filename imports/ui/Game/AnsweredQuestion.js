import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Card, Row, Col, Button, FormField, FormInput, Table } from 'elemental';

export default function AnsweredQuestion(props) {
  return (
    <Card>
      {props.question.text}
    </Card>
  );
}
