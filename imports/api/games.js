import { Mongo } from 'meteor/mongo';
// import { check } from 'meteor/check';

export const Games = new Mongo.Collection('games');

if (Meteor.isServer) {
  Meteor.publish('games', () => Games.find());
}

Meteor.methods({
  'games.insert'() {
    // Generate unique gameCode
    const existingGameCodes = Games.find({}, { fields: { code: 1 } }).fetch().map(game => game.code);
    let code;
    do {
      code = Math.floor(1000 + Math.random() * 9000);
    } while (existingGameCodes.includes(code));

    const game = {
      code: code,
      status: 'waiting',
      nextId: null,
      createdAt: new Date(),
      currentQuestion: null,
    };

    const gameId = Games.insert(game);
    return gameId;
  },
  'games.findGameByCode'(code) {
    console.log('games.findGameByCode:', code);
    return Games.findOne({ code: code });
  },
  'games.start'(id) {
    console.log('games.start:', id);
    const game = Games.findOne(id, { fields: { status: 1 } });
    if (game.status === 'waiting') {
      Games.update(id, {
        $set: {
          status: 'started'
        }
      });
      Meteor.call('questions.setPlayersAsOptions', id);
      Meteor.call('questions.select', id, 1, null);
    }
  },
  'games.end'(id) {
    console.log('games.end:', id);
    Games.update(id, {
      $set: {
        // currentQuestion: null, // may need refactoring?
        status: 'ended'
      }
    });
  },
  async 'games.restart'(id) {
    console.log('games.restart:', id);
    if (id) {
      const newGameId = await Meteor.call('games.insert');
      Games.update(id, {
        $set: {
          nextId: newGameId
        }
      });
      return newGameId;
    }
    return null;
  },
});
