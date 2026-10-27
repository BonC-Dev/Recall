// ids and saving. keeping this separate from the page stuff
var saveKey = "recall.decks.v1";

function makeId() {
  if (globalThis.crypto && crypto.randomUUID) return crypto.randomUUID();
  return "id" + Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function validateDecks(list) {
  if (!Array.isArray(list) || list.length > 300) throw new Error("That backup needs a decks list with at most 300 decks.");
  var deckIds = [];
  var count = 0;
  for (var i = 0; i < list.length; i++) {
    var d = list[i];
    if (!d || typeof d.id !== "string" || !d.id || d.id.length > 200 || deckIds.includes(d.id)) throw new Error("Deck IDs are missing or repeated.");
    deckIds.push(d.id);
    if (typeof d.name !== "string" || !d.name.trim() || d.name.length > 100) throw new Error("Each deck needs a name with 1 to 100 characters.");
    if (typeof d.createdAt !== "string" || !Number.isFinite(Date.parse(d.createdAt))) throw new Error("A deck has an invalid date.");
    if (!Array.isArray(d.cards)) throw new Error("A deck is missing its cards.");
    var cardIds = [];
    for (var j = 0; j < d.cards.length; j++) {
      var c = d.cards[j]; count++;
      if (count > 20000) throw new Error("That file has too many cards.");
      if (!c || typeof c.id !== "string" || !c.id || c.id.length > 200 || cardIds.includes(c.id)) throw new Error("Card IDs are missing or repeated.");
      cardIds.push(c.id);
      if (typeof c.question !== "string" || !c.question.trim() || c.question.length > 5000) throw new Error("A card needs a question with 1 to 5000 characters.");
      if (typeof c.answer !== "string" || !c.answer.trim() || c.answer.length > 5000) throw new Error("A card needs an answer with 1 to 5000 characters.");
    }
  }
  return true;
}

function loadDecks() {
  try {
    var raw = localStorage.getItem(saveKey);
    if (raw === null) return { decks: starterDecks(), notice: "" };
    var saved = JSON.parse(raw);
    if (!saved || saved.version !== 1) throw new Error("Unknown save version");
    validateDecks(saved.decks);
    return { decks: saved.decks, notice: "" };
  } catch (err) {
    return { decks: [], notice: "i couldnt load the cards that were saved here, and i left that saved data alone so i dont accidentally replace it just by opening the page" };
  }
}

function saveDecks(list) {
  try {
    validateDecks(list);
    localStorage.setItem(saveKey, JSON.stringify({ version: 1, decks: list }));
    return true;
  } catch (err) {
    return false;
  }
}

function starterDecks() {
  var cards = [
    {id:"me", question:"Am I the goat?", answer:"Yes"},
    {id:"pixl", question:"Is pixl the goat?", answer:"maybe, probably lol"},
    {id:"capcut", question:"is capcut the goat", answer:"nah, premier pro would mog"}
  ];
  var starter = {id:"practice", name:"goat set", sampleKey:"recall-starter-v1", cards:cards,
    createdAt:"2026-01-01T00:00:00.000Z"};
  return [starter]
}
