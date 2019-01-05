import { Mongo } from 'meteor/mongo';
import { Games } from './games';

export const Players = new Mongo.Collection('players');

if (Meteor.isServer) {
  Meteor.publish('players', () => Players.find());
}

Meteor.methods({
  'players.insert'(name, gameId, gameCode) {
    console.log('players.insert', name, gameId, gameCode);
    if (!gameId) {
      const game = Games.findOne({ code: gameCode });
      if (game) {
        gameId = game._id;
      } else {
        throw new Meteor.Error('wrong-game-code', 'Incorrect game code');
      }
    }
    const player = {
      gameId: gameId,
      name: name,
      score: 0,
      isReady: false,
      isRecipient: false,
      createdAt: new Date(),
    };

    const playerId = Players.insert(player);
    player._id = playerId;
    return player;
  },
  'players.remove'(id) {
    console.log('players.remove:', id);
    Players.remove(id);
  },
  'players.checkAllReady'(gameId) {
    const playerReady = Players.find({ gameId: gameId }).map(player => player.isReady);
    return playerReady.length > 1 && !playerReady.includes(false);
  },
  'players.ready'(id, gameId) {
    Players.update({ _id: id }, {
      $set: {
        isReady: true
      }
    });
    const allReady = Meteor.call('players.checkAllReady', gameId);
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
    const current = Players.findOne({ gameId: gameId, isRecipient: true });
    let nextId = '';
    if (current) {
      const next = Players.findOne({ createdAt: { $gt: current.createdAt } }, { sort: { createdAt: 1 } });
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
  'players.rename'(id, name) {
    Players.update({ _id: id }, { $set: { name } });
  },
});
