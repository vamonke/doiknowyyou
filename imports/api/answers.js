import { Mongo } from 'meteor/mongo';

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
    });
  },
});