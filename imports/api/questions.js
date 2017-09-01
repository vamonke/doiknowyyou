import { Mongo } from 'meteor/mongo';

export const Questions = new Mongo.Collection('questions');

Meteor.methods({
  'questions.insert'(gameCode, playerId, qna) {
    qna.forEach((set, i) => {
      Questions.upsert({
        gameCode: gameCode,
        playerId: playerId,
        number: i + 1,
      }, {
        gameCode: gameCode,
        playerId: playerId,
        number: i + 1,
        text: set.question,
        answers: set.answers
      });
    });
  }
});