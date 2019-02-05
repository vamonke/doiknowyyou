import { Mongo } from 'meteor/mongo';
import { Games } from './games';

export const Players = new Mongo.Collection('players');

if (Meteor.isServer) {
  Meteor.publish('players', () => Players.find());
}

Meteor.methods({
  'players.insert'(name, gameId, gameCode) {
    console.log('players.insert', name, gameId, gameCode);
    let validGameId = gameId;
    if (!validGameId) {
      const game = Games.findOne({ code: gameCode });
      if (game) {
        validGameId = game._id;
      } else {
        throw new Meteor.Error('wrong-game-code', 'Incorrect game code');
      }
    }
    const player = {
      gameId: validGameId,
      name: name,
      score: 0,
      isReady: false,
      createdAt: new Date(),
    };

    const playerId = Players.insert(player);
    player._id = playerId;
    return player;
  },
  'players.remove'(id) {
    console.log('players.remove:', id);
    Players.remove(id);
    Meteor.call('questions.removeByPlayerId', id);
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
  'players.getNewRecipient'(gameId, currentRecipientId) {
    let nextId = '';
    if (currentRecipientId) {
      const currentRecipient = Players.findOne(currentRecipientId);
      const next = Players.findOne({
        gameId,
        createdAt: { $gt: currentRecipient.createdAt }
      }, { sort: { createdAt: 1 } });
      if (next) {
        nextId = next._id;
      }
    }
    if (nextId === '') {
      nextId = Players.findOne({ gameId })._id;
    }
    return nextId;
  },
  'players.addScore'(id) {
    Players.update({ _id: id }, {
      $inc: { score: 1 }
    });
  },
  'players.rename'(id, name) {
    Players.update({ _id: id }, { $set: { name } });
  },
});
