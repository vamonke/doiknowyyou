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
      score: 0,
      isReady: false,
      isRecipient: false,
      createdAt: new Date(),
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
  'players.getRecipient'(gameCode) {
    let current = Players.findOne({ gameCode: gameCode, isRecipient: true });
    let nextId = '';
    if (current) {
      let next = Players.findOne({ createdAt: { $gt: current.createdAt } }, { sort: { createdAt: 1 } });
      if (next) {
        nextId = next._id;
      }
    }
    if (nextId === '') {
      nextId = Players.findOne({ gameCode: gameCode })._id;
    }
    Meteor.call('players.deselect', gameCode);
    Players.update({ _id: nextId }, { $set: { isRecipient: true } });
    return nextId;
  },
  'players.addScore'(id) {
    Players.update({ _id: id }, {
      $inc: { score: 1 }
    });
  },
  'players.deselect'(gameCode) {
    Players.update({ gameCode: gameCode, isRecipient: true }, { $set: { isRecipient: false } });
  },
});