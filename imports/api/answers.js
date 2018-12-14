import { Mongo } from 'meteor/mongo';
import { Players } from './players';

export const Answers = new Mongo.Collection('answers');

if (Meteor.isServer) {
  Meteor.publish('answers', function answersPublication() {
    return Answers.find();
  });
}

Meteor.methods({
  'answers.insert'(gameId, questionId, playerId, selected) {
    console.log('answers.insert:', gameId, questionId, playerId, selected);
    Answers.upsert({
      questionId: questionId,
      playerId: playerId,
    }, {
      questionId: questionId,
      playerId: playerId,
      selected: selected,
      createdAt: new Date(),
    });
    Meteor.call('questions.answer', playerId, questionId, selected);
    Meteor.call('answers.checkAllAnswered', gameId, questionId);
  },
  'answers.checkAllAnswered'(gameId, questionId) {
    console.log('answers.checkAllAnswered:', gameId, questionId);
    let answeredPlayerIds = Answers.find( // get playerIds from all answers for current question
      { questionId: questionId },
      {
        fields: { playerId: 1 },
        sort: { playerId: 1 }
      }
    ).fetch();
    let playerIds = Players.find( // get ids from all players from current game
      { gameId: gameId },
      {
        fields: { _id: 1 },
        sort: { _id: 1 }
      }
    ).fetch();
    if (
      (answeredPlayerIds.length === playerIds.length) // number of answers and players match
      &&
      playerIds.every(
        (idObject, i) => (idObject._id === answeredPlayerIds[i].playerId) // every id matches
      )
    ) {
      Meteor.call('questions.complete', questionId);
    };
  },
  async 'answers.insertOpen'(gameId, questionId, playerId, submission) {
    console.log('answers.insertOpen:', gameId, questionId, playerId, submission);
    // Add option to question
    const selection = await Meteor.call('questions.addOption', questionId, submission);
    // Insert answer
    Meteor.call('answers.insert', gameId, questionId, playerId, selection);
  }
});
