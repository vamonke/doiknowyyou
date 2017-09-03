import { Mongo } from 'meteor/mongo';

export const Questions = new Mongo.Collection('questions');

if (Meteor.isServer) {
  Meteor.publish('questions', function questionsPublication() {
    return Questions.find();
  });
}

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
        answers: set.answers,
        selected: false
      });
    });
  },
  'questions.select'() {
    let questionIds = Questions.find({ selected: false }, { fields: { _id: 1 } }).fetch();
    if (questionIds.length !== 0) {
      let id = questionIds[Math.floor(Math.random() * questionIds.length)]._id;
      Questions.update({ _id: id }, {
        $set: {
          selected: true
        }
      });
    }
  }
});