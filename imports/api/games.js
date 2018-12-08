import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Promise } from 'meteor/promise';

export const Games = new Mongo.Collection('games');

if (Meteor.isServer) {
  Meteor.publish('games', function gamesPublication() {
    return Games.find();
  });
}

Meteor.methods({
  'games.insert'() {
    // Generate unique gameCode
    let existingGameCodes = Games.find({}, { fields: { code: 1 }}).fetch().map(game => game.code);
    let collision = true;
    let code;
    while (collision) {
      code = Math.floor(1000 + Math.random() * 9000);
      collision = existingGameCodes.includes(code);
    }

    let game = {
      code: code,
      status: 'waiting',
      nextId: null,
      createdAt: new Date(),
      currentQuestion: null,
    };

    let gameId = Games.insert(game);
    return gameId;
  },
  'games.findGameByCode'(code) {
    console.log('games.findGameByCode:', code);
    return Games.findOne({ code: code });
  },
  'games.start'(id) {
    console.log('games.start:', id);
    let game = Games.findOne(id, { fields: { status: 1 }});
    if (game.status == 'waiting') {
      Meteor.call('questions.setPlayersAsOptions', id);
      Meteor.call('questions.select', id, 1);
      Games.update(id, {
        $set: {
          status: 'started'
        }
      });
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
      let newGameId = await Meteor.call('games.insert');
      Games.update(id, {
        $set: {
          nextId: newGameId
        }
      });
      return newGameId;
    };
  },
});
