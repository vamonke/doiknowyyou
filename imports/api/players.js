import { Mongo } from 'meteor/mongo';
import { Games } from './games';

export const Players = new Mongo.Collection('players');

if (Meteor.isServer) {
  Meteor.publish('players', function playersPublication() {
    return Players.find();
  });
}

Meteor.methods({
  'players.insert'(name, gameId, gameCode) {
    console.log('players.insert', name, gameId, gameCode);
    if (!gameId) {
      let game = Games.findOne({ code: gameCode });
      if (game) {
        gameId = game._id;
      }
    }
    let player = {
      gameId: gameId,
      name: name,
      score: 0,
      isReady: false,
      isRecipient: false,
      createdAt: new Date(),
    };

    let playerId = Players.insert(player);
    player._id = playerId;
    return player;
  },
  'players.remove'(id) {
    console.log('players.remove:', id);
    Players.remove(id);
  },
  'players.checkAllReady'(gameId) {
    let playerReady = Players.find({ gameId: gameId }).map(player => player.isReady);
    return !playerReady.includes(false);
  },
  'players.ready'(id, gameId) {
    Players.update({ _id: id }, {
      $set: {
        isReady: true
      }
    });
    let allReady = Meteor.call('players.checkAllReady', gameId);
    if (allReady) {
      Meteor.call('games.start', gameId);
    }
  },
  'players.unReady'(id) {
    Players.update({ _id: id }, {
      $set: {
        isReady: false
      }
    });
  },
  'players.getRecipient'(gameId) { // may need refactoring?
    let current = Players.findOne({ gameId: gameId, isRecipient: true });
    let nextId = '';
    if (current) {
      let next = Players.findOne({ createdAt: { $gt: current.createdAt } }, { sort: { createdAt: 1 } });
      if (next) {
        nextId = next._id;
      }
    }
    if (nextId === '') {
      nextId = Players.findOne({ gameId: gameId })._id;
    }
    Meteor.call('players.deselect', gameId);
    Players.update({ _id: nextId }, { $set: { isRecipient: true } });
    return nextId;
  },
  'players.addScore'(id) {
    Players.update({ _id: id }, {
      $inc: { score: 1 }
    });
  },
  'players.deselect'(gameId) {
    Players.update({ gameId: gameId, isRecipient: true }, { $set: { isRecipient: false } });
  },
});
