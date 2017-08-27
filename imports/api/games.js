import { Mongo } from 'meteor/mongo';

export const Games = new Mongo.Collection('games');

// function generateNewGame(){
//   var game = {
//     accessCode: generateAccessCode(),
//     state: "waitingForPlayers",
//     location: null,
//     lengthInMinutes: 8,
//     endTime: null,
//     paused: false,
//     pausedTime: null
//   };

//   var gameID = Games.insert(game);
//   game = Games.findOne(gameID);

//   return game;
// }

Meteor.methods({
  'games.insert'() {
    let game = {
      code: Math.floor(1000 + Math.random() * 9000),
      status: 'waiting',
      createdAt: new Date()
    };

    var gameID = Games.insert(game);
    game = Games.findOne(gameID);
    console.log(game);
    return game;
  }
});