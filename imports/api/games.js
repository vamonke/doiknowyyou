import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Games = new Mongo.Collection('games');

if (Meteor.isServer) {
  Meteor.publish('games', function gamesPublication() {
    return Games.find();
  });
}

Meteor.methods({
  'games.insert'() {
    let game = {
      code: Math.floor(1000 + Math.random() * 9000),
      status: 'waiting',
      createdAt: new Date(),
    };

    var gameID = Games.insert(game);
    game = Games.findOne(gameID);
    return game;
  },
  'games.start'(code) {
    Games.update({ code: code }, {
      $set: {
        status: 'started'
      }
    });
    Meteor.call('questions.select', code);
  },
  'games.end'(code) {
    Games.update({ code: code }, {
      $set: {
        status: 'ended'
      }
    });
  },
});