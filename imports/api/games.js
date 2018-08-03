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
      nextCode: null,
      createdAt: new Date(),
    };

    var gameID = Games.insert(game);
    game = Games.findOne(gameID);
    return game;
  },
  'games.start'(code) {
    let game = Games.findOne({ code: code }, { fields: { status: 1 }});
    if (game.status == 'waiting') {
      Meteor.call('questions.select', code, 1);
      Games.update({ code: code }, {
        $set: {
          status: 'started'
        }
      });
    }
  },
  'games.end'(code) {
    Games.update({ code: code }, {
      $set: {
        status: 'ended'
      }
    });
  },
  'games.restart'(code) {
    if (!code) {
      throw 'No code';
    }
    Meteor.call('games.insert', (error, newGame) => {
      console.log(newGame);
      Games.update({ code: code }, {
        $set: {
          nextCode: newGame.code
        }
      });
      return newGame;
    });
  },
});
