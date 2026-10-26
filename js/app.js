// page bits
var decks = [];
var activeId = null;
var editingId = null;
var studyRound = null;
var currentScreen = "library";

function el(id) { return document.getElementById(id) }
function say(message) { el("notice").textContent = message }
function currentDeck() { return decks.find(function(d) { return d.id === activeId }) }

function showScreen(name) {
  if (currentScreen === "study" && name !== "study" && studyRound && studyRound.position < studyRound.cards.length) {
    if (!confirm("if i go back now this round will stop here, but the cards themselves will still be in the deck when i come back")) return false;
    studyRound = null;
  }
  ["library", "editor", "study"].forEach(function(s) { el(s + "Screen").hidden = s !== name });
  currentScreen = name;
  var heading = name === "library" ? "libraryHeading" : name === "editor" ? "editorHeading" : "studyHeading";
  el(heading).focus();
  return true;
}

function saveEverything(message) {
  saveDecks(decks);
  say(message || "the change is showing in this tab, but saving between visits isnt ready yet.");
}

// library
function renderLibrary() {
  var list = el("deckList"); list.replaceChildren();
  el("emptyLibrary").hidden = decks.length !== 0;
  el("deckTotal").textContent = decks.length + (decks.length === 1 ? " deck" : " decks");
  decks.forEach(function(deck, i) {
    var box = document.createElement("article"); box.className = "deck-tile color" + (i % 4);
    var tag = document.createElement("span"); tag.className = "deck-number"; tag.textContent = String(i+1).padStart(2,"0");
    var title = document.createElement("h3"); title.textContent = deck.name;
    var count = document.createElement("p"); count.textContent = deck.cards.length + (deck.cards.length === 1 ? " card" : " cards");
    var buttons = document.createElement("div"); buttons.className = "tile-actions";
    var open = document.createElement("button"); open.type = "button"; open.textContent = "open deck";
    open.setAttribute("aria-label", "Open " + deck.name); open.onclick = function() { openDeck(deck.id) };
    var remove = document.createElement("button"); remove.type = "button"; remove.className = "text-button danger";
    remove.textContent = "delete"; remove.setAttribute("aria-label", "Delete " + deck.name);
    remove.onclick = function() { deleteDeck(deck.id) };
    buttons.append(open, remove); box.append(tag, title, count, buttons); list.append(box);
  });
}

function openDeck(id) {
  activeId = id; renderEditor(); showScreen("editor"); say("");
}

function renderEditor() {
  var d=currentDeck(); if (!d) return;
  el("editorHeading").textContent=d.name;
  el("editorCount").textContent=d.cards.length + " cards";
  el("renameName").value=d.name;
}

// deck actions
function createDeck(event) {
  event.preventDefault();
  var name = el("deckName").value.trim();
  if (!name) { say("give the deck a name first so it doesnt end up blank."); el("deckName").focus(); return }
  if (name.length > 100 || decks.length >= 300) { say("the name needs to be shorter than 101 characters and there needs to be room for another deck before i can add this one"); return }
  decks.push({ id:makeId(), name:name, cards:[], createdAt:new Date().toISOString() });
  el("deckForm").reset(); renderLibrary(); saveEverything("the deck has been added, so you can open it and put some cards in there.");
}

function renameDeck(event) {
  event.preventDefault();
  var d = currentDeck();
  var name = el("renameName").value.trim();
  if (!d || !name) { say("i cant use an empty name for this deck so i need to put something in that box before changing it"); return }
  if (name.length > 100) { say("i need to keep the name under 101 characters because that is the limit i put on the name box"); return }
  d.name = name;
  renderEditor(); renderLibrary(); saveEverything("the deck has its new name and all its cards are still there.");
}

function deleteDeck(id) {
  var deck = decks.find(function(d) { return d.id === id });
  if (!deck || !confirm('Delete "' + deck.name + '" and all its cards?')) return;
  decks = decks.filter(function(d) { return d.id !== id });
  renderLibrary(); saveEverything("the deck and its cards have been removed from your list.");
}

// hook everything up
var loaded=loadDecks(); decks=loaded.decks;
el("deckForm").addEventListener("submit",createDeck);
el("renameForm").addEventListener("submit",renameDeck);
el("homeButton").onclick=function() { if (showScreen("library")) renderLibrary() };
el("backButton").onclick=function() { if (showScreen("library")) renderLibrary() };
renderLibrary();
if (loaded.notice) say(loaded.notice);
