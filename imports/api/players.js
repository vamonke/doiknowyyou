import { Mongo } from 'meteor/mongo';

export const Players = new Mongo.Collection('players');

// function generateNewPlayer(game, name){
//   var player = {
//     gameID: game._id,
//     name: name,
//     role: null,
//     isSpy: false,
//     isFirstPlayer: false
//   };

//   var playerID = Players.insert(player);

//   return Players.findOne(playerID);
// }

Meteor.methods({
  'players.insert'(name, gameID) {
    Players.insert({
      gameID: gameID,
      name: name,
      role: null,
      isSpy: false,
      isFirstPlayer: false
    });
  }
});