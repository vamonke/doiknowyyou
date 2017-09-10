import { Mongo } from 'meteor/mongo';
import { Players } from './players';

export const Answers = new Mongo.Collection('answers');

if (Meteor.isServer) {
  Meteor.publish('answers', function answersPublication() {
    return Answers.find();
  });
}

Meteor.methods({
  'answers.insert'(gameCode, questionId, playerId, selected) {
    Answers.upsert({
      gameCode: gameCode,
      questionId: questionId,
      playerId: playerId,
    }, {
      gameCode: gameCode,
      questionId: questionId,
      playerId: playerId,
      selected: selected,
      createdAt: new Date(),
    });
    Meteor.call('questions.answer', playerId, questionId, selected);
    let hasAllAnswered = Meteor.call('answers.hasAllAnswered', gameCode, questionId);
    if (hasAllAnswered) {
      Meteor.call('questions.complete', gameCode, questionId);
    }
    return hasAllAnswered;
  },
  'answers.hasAllAnswered'(gameCode, questionId) {
    let answeredPlayerIds = Answers.find( // get playerIds from all answers for current question
      { questionId: questionId },
      { 
        fields: { playerId: 1 },
        sort: { playerId: 1 }
      }
    ).fetch();

    let playerIds = Players.find( // get ids from all players from current game
      { gameCode: gameCode },
      {
        fields: { _id: 1 },
        sort: { _id: 1 }
      }
    ).fetch();

    return (
      (answeredPlayerIds.length === playerIds.length) &&
      playerIds.every((idObject, i) => (idObject._id === answeredPlayerIds[i].playerId))
    );
  }
});