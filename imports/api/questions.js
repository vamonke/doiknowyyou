import { Mongo } from 'meteor/mongo';
import { Players } from './players';
import { Answers } from './answers';

export const Questions = new Mongo.Collection('questions');

if (Meteor.isServer) {
  Meteor.publish('questions', function questionsPublication() {
    return Questions.find();
  });
}

Meteor.methods({
  'questions.insert'(gameCode, playerId, qna) {
    qna.filter(set => {
      return set.question // remove empty questions
    }).forEach((set, i) => {
      Questions.upsert({
        gameCode: gameCode,
        playerId: playerId,
        number: i + 1,
      }, {
        gameCode: gameCode,
        playerId: playerId,
        number: i + 1,
        round: null,
        text: set.question,
        options: set.options,
        status: 'unasked',
        recipientId: null,
        correctAnswer: null,
        answeredAt: null,
        createdAt: new Date(),
      });
    });
  },
  'questions.select'(gameCode, round) { // choose a question
    let unaskedIds = Questions.find({ gameCode: gameCode, status: 'unasked' }, { fields: { _id: 1 } }).fetch();
    if (unaskedIds.length !== 0) {
      let recipientId = Meteor.call('players.getRecipient', gameCode);
      let id = unaskedIds[Math.floor(Math.random() * unaskedIds.length)]._id;
      Questions.update({ _id: id }, {
        $set: {
          status: 'asking',
          recipientId: recipientId,
          round: round
        }
      });
    } else { // End game when there no more unasked questions
      Meteor.call('players.deselect', gameCode);
      Meteor.call('games.end', gameCode);
    }
  },
  'questions.complete'(gameCode, id) {
    Questions.update({ _id: id }, {
      $set: {
        status: 'asked',
        answeredAt: new Date(),
      }
    });
    // Tabulate scores
    let question = Questions.findOne({ _id: id });
    Answers.find({ questionId: id }).fetch().map((answer) => {
      if (
        (answer.playerId !== question.recipientId) &&
        (answer.selected === question.correctAnswer)
      ) {
        Meteor.call('players.addScore', answer.playerId);
      }
    });
    Meteor.call('questions.select', gameCode, question.round + 1);
  },
  'questions.answer'(playerId, id, answer) { // set the recipient's answer as the correct answer
    let question = Questions.findOne({ _id: id });
    if (playerId === question.recipientId) {
      Questions.update({ _id: id }, {
        $set: {
          correctAnswer: Number(answer),
        }
      });
    }
  },
});
