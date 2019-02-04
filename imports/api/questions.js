import { Mongo } from 'meteor/mongo';
import { Games } from './games';
import { Players } from './players';
import { Answers } from './answers';

export const Questions = new Mongo.Collection('questions');

if (Meteor.isServer) {
  Meteor.publish('questions', () => Questions.find());
}

Meteor.methods({
  'questions.insert'(gameId, playerId, qna) {
    qna.filter(set => set.question).forEach((set, i) => { // remove empty questions
      Questions.upsert({
        gameId: gameId,
        authorId: playerId,
        number: i + 1,
      }, {
        gameId: gameId,
        authorId: playerId,
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
    const playerNames = Players.find({ gameId: gameId }).map(player => player.name);
    Questions.update({ gameId: gameId, format: 'players' }, {
      $set: { options: playerNames }
    }, { multi: true });
  },
  'questions.select'(gameId, round) { // choose a question
    const unaskedIds = Questions.find({ gameId: gameId, status: 'unasked' }, { fields: { _id: 1 } }).fetch();
    if (unaskedIds.length !== 0) {
      const recipientId = Meteor.call('players.getRecipient', gameId);
      const questionId = unaskedIds[Math.floor(Math.random() * unaskedIds.length)]._id;
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
      console.log(`New question: ${questionId}`);
    } else { // End game when there no more unasked questions
      Meteor.call('players.deselect', gameId);
      Meteor.call('games.end', gameId);
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
    const question = Questions.findOne(id);
    Answers.find({ questionId: id }).fetch().forEach((answer) => {
      if (
        (answer.playerId !== question.recipientId)
        && (question.correctAnswer.includes(answer.selected))
      ) {
        Meteor.call('players.addScore', answer.playerId);
      }
    });
    Meteor.call('questions.select', question.gameId, question.round + 1);
  },
  async 'questions.addOption'(id, answer) { // insert open-ended option
    await Questions.update(id, { $push: { options: answer } }); // insert option
    const question = Questions.findOne(id);
    const answerIndex = question.options.findIndex(option => option === answer); // get answer index
    return answerIndex;
  },
  'questions.answer'(playerId, id, answer) { // set the recipient's answer as the correct answer
    const question = Questions.findOne(id);
    let answerArray = answer;
    if (playerId === question.recipientId) {
      if (!Array.isArray(answerArray)) {
        answerArray = [answerArray];
      }
      answerArray = answerArray.map(Number);
      Questions.update({ _id: id }, {
        $set: { correctAnswer: answerArray }
      });
    }
  },
  'questions.removeByPlayerId'(playerId) {
    Questions.remove({ authorId: playerId, status: 'unasked' });
  }
});
