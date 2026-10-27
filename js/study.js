// the study round is just an object. the page draws it
function makeStudyRound(cards, shuffle) {
  var order = cards.map(function(c) { return { id:c.id, question:c.question, answer:c.answer } });
  return { cards:order, position:0, correct:0, missed:[], revealed:false };
}

function revealStudyCard(r) {
  if (!r || r.position >= r.cards.length) return false;
  r.revealed = true;
  return true;
}

function answerStudyCard(r, gotIt) {
  if (!r || r.position >= r.cards.length || !r.revealed) return false;
  if (gotIt) r.correct++;
  else r.missed.push(r.cards[r.position]);
  r.position++;
  r.revealed = false;
  return true;
}

function studySummary(r) {
  var total = r ? r.cards.length : 0;
  return { correct:r ? r.correct : 0, missed:r ? r.missed.length : 0,
    accuracy:total ? Math.round(r.correct / total * 100) : 0 };
}
