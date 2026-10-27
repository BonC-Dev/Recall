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
    if (!confirm("if I go back now this round will stop here (cards will still be saved)")) return false;
    studyRound = null;
  }
  ["library", "editor", "study"].forEach(function(s) { el(s + "Screen").hidden = s !== name });
  currentScreen = name;
  var heading = name === "library" ? "libraryHeading" : name === "editor" ? "editorHeading" : "studyHeading";
  el(heading).focus();
  return true;
}

function saveEverything(message) {
  if (saveDecks(decks)) say(message || "your changes are saved in this browser so they should be here when you come back.");
  else say("the browser couldnt save that change, so keep this tab open and export a backup before closing it.");
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
  activeId = id;
  editingId = null;
  el("cardSearch").value = "";
  resetCardForm(); renderEditor(); showScreen("editor");
  say("");
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

// card stuff
function resetCardForm() {
  editingId = null;
  el("cardForm").reset(); el("cardFormHeading").textContent = "add a card";
  el("saveCardButton").textContent = "add card"; el("cancelEditButton").hidden = true;
}

function renderEditor() {
  var d = currentDeck(); if (!d) return;
  el("editorHeading").textContent = d.name;
  el("renameName").value = d.name;
  el("editorCount").textContent = d.cards.length + (d.cards.length === 1 ? " card ready to practice" : " cards ready to practice");
  el("studyButton").disabled = d.cards.length === 0;
  el("emptyStudyNote").textContent = d.cards.length ? "" : "add at least one card before starting a study round.";
  var search = el("cardSearch").value.trim().toLowerCase();
  var shown = d.cards.filter(function(c) { return (c.question + " " + c.answer).toLowerCase().includes(search) });
  el("noCards").textContent = d.cards.length === 0 ? "there arent any cards in this deck yet, so add a question and answer to get started." : "nothing matched that search, so try a different word from the question or answer.";
  el("noCards").hidden = shown.length > 0;
  var list = el("cardList"); list.replaceChildren();
  shown.forEach(function(card) {
    var box = document.createElement("article"); box.className = "saved-card";
    var q = document.createElement("h3"); q.textContent = card.question;
    var a = document.createElement("p"); a.textContent = card.answer.length > 140 ? card.answer.slice(0,140) + "..." : card.answer;
    var actions = document.createElement("div"); actions.className = "tile-actions";
    var edit = document.createElement("button"); edit.type="button"; edit.className="secondary"; edit.textContent="edit";
    edit.setAttribute("aria-label", "Edit card: " + card.question.slice(0,80)); edit.onclick = function() { editCard(card.id) };
    var del = document.createElement("button"); del.type="button"; del.className="text-button danger"; del.textContent="delete";
    del.setAttribute("aria-label", "Delete card: " + card.question.slice(0,80)); del.onclick = function() { deleteCard(card.id) };
    actions.append(edit,del); box.append(q,a,actions); list.append(box);
  });
}

function saveCard(event) {
  event.preventDefault();
  var d=currentDeck(); if (!d) return;
  var q=el("questionInput").value.trim(); var a=el("answerInput").value.trim();
  if (!q || !a) { say("fill in both sides of the card before adding it to the deck."); return }
  if (q.length > 5000 || a.length > 5000) { say("one of those boxes has more than 5000 characters in it so i need to make it a bit shorter before adding the card"); return }
  if (editingId) {
    var old=d.cards.find(function(c) { return c.id === editingId });
    if (!old) { say("the card i was changing is not in this deck anymore so i need to start another one instead of trying to save over it"); resetCardForm(); return }
    old.question=q; old.answer=a;
  } else {
    var total=decks.reduce(function(n,deck) { return n+deck.cards.length },0);
    if (total >= 20000) { say("there are already 20000 cards across these decks so i need to remove some before i can add another one"); return }
    d.cards.push({ id:makeId(), question:q, answer:a });
  }
  resetCardForm(); renderEditor(); renderLibrary(); saveEverything("your card is saved in the deck with the question and answer you entered."); el("questionInput").focus();
}

function editCard(id) {
  var d=currentDeck(); if (!d) return;
  var c=d.cards.find(function(item) { return item.id === id }); if (!c) return;
  editingId=id; el("questionInput").value=c.question; el("answerInput").value=c.answer;
  el("cardFormHeading").textContent="edit card"; el("saveCardButton").textContent="save changes";
  el("cancelEditButton").hidden=false; el("questionInput").focus();
}

function deleteCard(id) {
  var d=currentDeck(); if (!d) return;
  var c=d.cards.find(function(item) { return item.id === id });
  if (!c || !confirm('Delete the card "' + c.question.slice(0,80) + '"?')) return;
  d.cards=d.cards.filter(function(item) { return item.id !== id });
  if (editingId === id) resetCardForm();
  renderEditor(); renderLibrary(); saveEverything("the card has been removed and the other cards are still in the deck.");
}

// study page
function beginStudy(cards) {
  var d=currentDeck(); if (!d) return;
  var list=cards || d.cards;
  if (!list.length) { say("there arent any cards to put in this round, so i need to go back and add some before trying again"); return }
  studyRound=makeStudyRound(list,el("shuffleBox").checked);
  say(""); showScreen("study"); drawStudy();
}

function drawStudy() {
  var r=studyRound; if (!r) return;
  var finished=r.position >= r.cards.length;
  el("studyCard").hidden=finished; el("results").hidden=!finished;
  el("studyProgress").textContent=finished ? "round finished" : (r.position+1) + " of " + r.cards.length + " cards have come up in this round so far";
  if (finished) {
    var score=studySummary(r);
    el("correctTotal").textContent=score.correct;
    el("missedTotal").textContent=score.missed;
    el("accuracyTotal").textContent=score.accuracy + "%";
    el("resultMessage").textContent=score.missed === 0 ? "I got through all " + r.cards.length + " cards without marking any of them wrong, so i can either have another go or go back to the deck" : "I got " + score.correct + " out of " + r.cards.length + " right this time, and there are " + score.missed + " that i can try again without going through the whole deck";
    el("retryButton").hidden=score.missed === 0;
    el("keyInstructions").hidden=true;
    el("resultsHeading").focus();
  } else {
    var c=r.cards[r.position];
    el("studyDeckName").textContent=currentDeck().name;
    el("studyQuestion").textContent=c.question;
    el("studyAnswer").textContent=c.answer; el("studyAnswer").hidden=!r.revealed;
    el("revealButton").hidden=r.revealed; el("answerButtons").hidden=!r.revealed;
    el("keyInstructions").hidden=false;
    if (r.revealed) el("correctButton").focus();
    else el("revealButton").focus();
  }
}

function revealAnswer() { if (revealStudyCard(studyRound)) drawStudy() }
function markAnswer(correct) { if (answerStudyCard(studyRound,correct)) drawStudy() }

// backup buttons
function exportBackup() {
  var data=makeBackup(decks);
  var url=URL.createObjectURL(new Blob([data],{type:"application/json"}));
  var link=document.createElement("a"); link.href=url;
  link.download="recall-backup-" + new Date().toISOString().slice(0,10) + ".json";
  document.body.append(link); link.click(); link.remove();
  setTimeout(function() { URL.revokeObjectURL(url) },1000);
  say("the backup has been downloaded so I can keep a copy of it");
}

async function importBackup(event) {
  var input=event.target; var file=input.files[0]; if (!file) return;
  input.disabled=true;
  try {
    if (file.size > 5000000) throw new Error("the backup needs to be smaller than 5 MB before i can bring its decks into this page");
    var text=await file.text();
    var oldCount=decks.length;
    var next=readBackup(text,decks);
    decks=next; renderLibrary();
    saveEverything("Added " + (decks.length-oldCount) + " deck copies. Your earlier decks are still here.");
  } catch (err) { say("Import stopped: " + err.message + " Your existing decks were kept.") }
  finally { input.value=""; input.disabled=false }
}

// sample deck
function loadSample() {
  var existing=decks.find(function(d) { return d.sampleKey === "recall-starter-v1" });
  if (existing) { openDeck(existing.id); say("the goat set is already in my list so i opened that one instead of putting another copy in here"); return }
  if (decks.length >= 300 || decks.reduce(function(n,d) { return n+d.cards.length },0) > 19997) {
    say("there isnt enough room for another copy of the goat set so i need to make a backup and remove some old cards before adding it"); return;
  }
  var examples=[
    ["Am I the goat?","Yes"],
    ["Is pixl the goat?","maybe, probably lol"],
    ["is capcut the goat","nah, premier pro would mog"]
  ];
  var deck={id:makeId(),name:"goat set",cards:[],createdAt:new Date().toISOString(),sampleKey:"recall-starter-v1"};
  examples.forEach(function(pair) { deck.cards.push({id:makeId(),question:pair[0],answer:pair[1]}) });
  decks.push(deck); renderLibrary(); saveEverything("Sample added. Open it whenever you want a quick round.");
}

// keyboard bits
function studyKeys(event) {
  if (currentScreen !== "study" || event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
  var target=event.target;
  if (target && (target.matches("input, textarea, select") || target.isContentEditable)) return;
  if (!studyRound || studyRound.position >= studyRound.cards.length) return;
  if (event.code === "Space") {
    event.preventDefault(); if (!studyRound.revealed) revealAnswer();
  } else if (event.key === "1" || event.key === "2") {
    event.preventDefault(); markAnswer(event.key === "1");
  }
}

function warnBeforeClose(event) {
  if (currentScreen === "study" && studyRound && studyRound.position < studyRound.cards.length) {
    event.preventDefault(); event.returnValue="";
  }
}

// hook everything up
var loaded=loadDecks(); decks=loaded.decks;
el("deckForm").addEventListener("submit",createDeck);
el("renameForm").addEventListener("submit",renameDeck);
el("cardForm").addEventListener("submit",saveCard);
el("cancelEditButton").onclick=resetCardForm;
el("cardSearch").addEventListener("input",renderEditor);
el("homeButton").onclick=function() { if (showScreen("library")) renderLibrary() };
el("backButton").onclick=function() { if (showScreen("library")) renderLibrary() };
el("studyButton").onclick=function() { beginStudy() };
el("revealButton").onclick=revealAnswer;
el("correctButton").onclick=function() { markAnswer(true) };
el("missedButton").onclick=function() { markAnswer(false) };
el("retryButton").onclick=function() { var missed=retryCards(studyRound); beginStudy(missed) };
el("againButton").onclick=function() { beginStudy() };
el("doneButton").onclick=function() { renderEditor(); showScreen("editor") };
el("leaveStudyButton").onclick=function() { if (showScreen("editor")) renderEditor() };
el("exportButton").onclick=exportBackup;
el("importFile").addEventListener("change",importBackup);
el("sampleButton").onclick=loadSample;
document.addEventListener("keydown",studyKeys);
window.addEventListener("beforeunload",warnBeforeClose);
renderLibrary();
if (loaded.notice) say(loaded.notice);
