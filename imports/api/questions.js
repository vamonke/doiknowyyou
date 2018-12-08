import { Mongo } from 'meteor/mongo';
import { Games } from './games';
import { Players } from './players';
import { Answers } from './answers';

export const Questions = new Mongo.Collection('questions');

if (Meteor.isServer) {
  Meteor.publish('questions', function questionsPublication() {
    return Questions.find();
  });
}

Meteor.methods({
  'questions.insert'(gameId, playerId, qna) {
    qna.filter(set => {
      return set.question // remove empty questions
    }).forEach((set, i) => {
      Questions.upsert({
        gameId: gameId,
        playerId: playerId,
        number: i + 1,
      }, {
        gameId: gameId,
        playerId: playerId,
        number: i + 1,
        round: null,
        text: set.question,
        format: set.format,
        options: set.options,
        status: 'unasked',
        recipientId: null,
        correctAnswer: null,
        answeredAt: null,
        createdAt: new Date(),
      });
    });
  },
  'questions.setPlayersAsOptions'(gameId) { // set player names as options
    let playerNames = Players.find({ gameId: gameId }).map(player => player.name);
    Questions.update({ gameId: gameId, format: 'players' }, {
      $set: { options: playerNames }
    });
  },
  'questions.select'(gameId, round) { // choose a question
    let unaskedIds = Questions.find({ gameId: gameId, status: 'unasked' }, { fields: { _id: 1 } }).fetch();
    if (unaskedIds.length !== 0) {
      let recipientId = Meteor.call('players.getRecipient', gameId);
      let questionId = unaskedIds[Math.floor(Math.random() * unaskedIds.length)]._id;
      Questions.update(questionId, {
        $set: {
          status: 'asking',
          recipientId: recipientId,
          round: round
        }
      });
      Games.update(gameId, {
        $set: {
          currentQuestion: questionId,
        }
      });
      console.log('New question: ' + questionId);
    } else { // End game when there no more unasked questions
      Meteor.call('players.deselect', gameId);
      Meteor.call('games.end', gameId);
      return null;
    }
  },
  'questions.complete'(id) {
    Questions.update(id, {
      $set: {
        status: 'asked',
        answeredAt: new Date(),
      }
    });
    // Tabulate scores
    let question = Questions.findOne(id);
    Answers.find({ questionId: id }).fetch().map(answer => {
      if (
        (answer.playerId !== question.recipientId) &&
        (answer.selected === question.correctAnswer)
      ) {
        Meteor.call('players.addScore', answer.playerId);
      }
    });
    Meteor.call('questions.select', question.gameId, question.round + 1);
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
