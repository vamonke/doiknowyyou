import { Mongo } from 'meteor/mongo';

export const Players = new Mongo.Collection('players');

if (Meteor.isServer) {
  Meteor.publish('players', function playersPublication() {
    return Players.find();
  });
}

Meteor.methods({
  'players.insert'(name, gameCode) {
    return Players.insert({
      gameCode: gameCode,
      name: name,
      role: null,
      isReady: false
    });
  },
  'players.ready'(id) {
    Players.update({ _id: id }, {
      $set: {
        isReady: true
      }
    });
  },
  'players.unReady'(id) {
    Players.update({ _id: id }, {
      $set: {
        isReady: false
      }
    });
  },
  'players.getNameById'(id) {
    return Players.findOne({ _id: id }).name;
  },
});