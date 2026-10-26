// i put the goat set directly in here for now because the loading part is still pretty basic
var saveKey = "recall.decks.v1";

function makeId() {
  if (globalThis.crypto && crypto.randomUUID) return crypto.randomUUID();
  var bit = Math.random().toString(36).slice(2)
  return "id" + Date.now().toString(36) + bit;
}

function loadDecks() {
  var cards = [
    {id:"me", question:"Am I the goat?", answer:"Yes"},
    {id:"pixl", question:"Is pixl the goat?", answer:"maybe, probably lol"},
    {id:"capcut", question:"is capcut the goat", answer:"nah, premier pro would mog"}
  ];
  var starter = {id:"practice", name:"goat set", cards:cards,
    createdAt:"2026-01-01T00:00:00.000Z"};
  return {decks:[starter], notice:""}
}

function saveDecks(list) {
  // this is only here so the buttons can call it, the actual saving part still needs to be added later
  return true
}
