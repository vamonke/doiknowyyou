import React, { Component } from 'react';
import { Card } from 'elemental';
 
// Game component - represents a single todo item
export default class Game extends Component {
  render() {
    return (
      <div className="container">
        <div className="title">
          {this.props.match.params.code}
        </div>
      </div>
    );
  }
}
