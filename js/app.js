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
    buttons.append(open); box.append(tag, title, count, buttons); list.append(box);
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

// hook everything up
var loaded=loadDecks(); decks=loaded.decks;
el("homeButton").onclick=function() { if (showScreen("library")) renderLibrary() };
el("backButton").onclick=function() { if (showScreen("library")) renderLibrary() };
renderLibrary();
if (loaded.notice) say(loaded.notice);
