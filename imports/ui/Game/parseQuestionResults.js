export default function parseQuestionResults(question, players, answers) {
  function getPlayerNameFromId(playerId) {
    if (playerId) {
      let player = players.find(player => (player._id === playerId));
      return player && player.name;
    };
  }
  let answerSets = [];
  question.options.forEach((option, index) => {
    answerSets[index] = {
      option: option,
      players: []
    };
  })
  answers.forEach(answer => {
    if (answer.playerId) {
      const playerName = getPlayerNameFromId(answer.playerId);
      answerSets[answer.selected].players.push([playerName]);
    }
  });
  return answerSets;
}
