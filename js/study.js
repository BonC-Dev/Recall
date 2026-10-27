// the study round is just an object. the page draws it
function makeStudyRound(cards, shuffle) {
  var order = cards.map(function(c) { return { id:c.id, question:c.question, answer:c.answer } });
  if (shuffle) {
    for (var i = order.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = order[i]; order[i] = order[j]; order[j] = temp;
    }
  }
  return { cards:order, position:0, correct:0, missed:[], revealed:false, lastAnswerAt:0 };
}

function revealStudyCard(r) {
  if (!r || r.position >= r.cards.length) return false;
  r.revealed = true;
  return true;
}

function answerStudyCard(r, gotIt) {
  if (!r || r.position >= r.cards.length || !r.revealed) return false;
  // another click from the old answer must not count for the new card
  if (Date.now() - r.lastAnswerAt < 250) return false;
  if (gotIt) r.correct++;
  else r.missed.push(r.cards[r.position]);
  r.position++;
  r.revealed = false;
  r.lastAnswerAt = Date.now();
  return true;
}

function studySummary(r) {
  var total = r ? r.cards.length : 0;
  return { correct:r ? r.correct : 0, missed:r ? r.missed.length : 0,
    accuracy:total ? Math.round(r.correct / total * 100) : 0 };
}

function retryCards(round) {
  var cards=[];
  for (var i=0;i<round.missed.length;i++) cards.push(round.missed[i]);
  return cards;
}
