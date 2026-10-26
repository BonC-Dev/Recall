// run this with node tests/check.cjs
var fs=require("node:fs"),path=require("node:path"),vm=require("node:vm"),assert=require("node:assert/strict");
var root=path.join(__dirname,".."), level=Number(process.argv[2]||8), only=process.argv[3]||"", passed=0;
var source={};
for(var file of ["js/storage.js","js/study.js","js/app.js"]) source[file]=fs.readFileSync(path.join(root,file),"utf8");
function context() {
  var memory={};
  var c=vm.createContext({crypto:require("node:crypto").webcrypto,console,Blob,URL,setTimeout,
    localStorage:{getItem:k=>memory[k]===undefined?null:memory[k],setItem:(k,v)=>memory[k]=v},
    document:{getElementById:()=>({value:"",focus(){},hidden:false,textContent:"",replaceChildren(){}})},confirm:()=>true});
  for(var f of ["js/storage.js","js/study.js"])vm.runInContext(source[f],c);
  vm.runInContext(source["js/app.js"].split("// hook everything up")[0],c);
  return c;
}
function go(c,code){return vm.runInContext(code,c)}
function test(name,min,fn) {
  if(level<min || (only && only!==name))return;
  try {fn(context());passed++;console.log("PASS "+name)}
  catch(e){console.error("FAIL "+name+": "+e.name+": "+e.message);process.exitCode=1}
}
var deck={id:"one",name:"test deck",createdAt:"2026-01-01T00:00:00.000Z",cards:[{id:"a",question:"q1",answer:"a1"},{id:"b",question:"q2",answer:"a2"},{id:"c",question:"q3",answer:"a3"}]};
test("source-syntax",1,c=>{for(var f in source)new vm.Script(source[f]);});
test("deck-ids",2,c=>assert.notEqual(go(c,"makeId()"),go(c,"makeId()")));
test("deck-blank",2,c=>{go(c,'el=function(){return {value:"   ",focus:function(){}}};renderLibrary=function(){};saveEverything=function(){};say=function(){};decks=[];createDeck({preventDefault:function(){}})');assert.equal(go(c,"decks.length"),0)});
test("card-required-sides",3,c=>{go(c,'decks=[{id:"one",cards:[]}];activeId="one";var cells={questionInput:{value:"question"},answerInput:{value:""}};el=function(id){return cells[id]||{focus:function(){}}};renderEditor=function(){};renderLibrary=function(){};saveEverything=function(){};say=function(){};resetCardForm=function(){};saveCard({preventDefault:function(){}})');assert.equal(go(c,"decks[0].cards.length"),0)});
test("storage-roundtrip",4,c=>{c.example=deck;go(c,"saveDecks([example])");assert.equal(go(c,"loadDecks().decks[0].cards[1].answer"),"a2")});
test("storage-corrupt",4,c=>{go(c,'localStorage.setItem(saveKey,"{broken")');assert.equal(go(c,"loadDecks().decks.length"),0);assert.equal(go(c,"localStorage.getItem(saveKey)"),"{broken")});
test("storage-empty",4,c=>{go(c,"saveDecks([])");assert.equal(go(c,"loadDecks().decks.length"),0)});
test("storage-unavailable",4,c=>{c.example=deck;go(c,'localStorage.setItem=function(){throw Error("full")}');assert.equal(go(c,"saveDecks([example])"),false)});
test("study-reveal",5,c=>{c.example=deck;go(c,"var round=makeStudyRound(example.cards,false)");assert.equal(go(c,"answerStudyCard(round,true)"),false);assert.equal(go(c,"round.position"),0)});
test("study-round",5,c=>{c.example=deck;go(c,"var round=makeStudyRound(example.cards,false),clock=1000;Date.now=function(){return clock}");for(var yes of [true,false,true]){go(c,"clock+=300;revealStudyCard(round)");go(c,"answerStudyCard(round,"+yes+")")}assert.equal(go(c,"studySummary(round).correct"),2);assert.equal(go(c,"round.missed.length"),1)});
test("shuffle-copy",6,c=>{c.example=deck;var before=JSON.stringify(deck.cards);go(c,"Math.random=function(){return 0};makeStudyRound(example.cards,true)");assert.equal(JSON.stringify(c.example.cards),before)});
test("retry-list",6,c=>{c.example=deck;go(c,"var round=makeStudyRound(example.cards,false);round.missed=[example.cards[1]]");assert.equal(go(c,"retryCards(round).length"),1)});
test("backup-roundtrip",7,c=>{c.example=deck;assert.equal(go(c,"readBackup(makeBackup([example]),[])[0].cards.length"),3);assert.notEqual(go(c,"readBackup(makeBackup([example]),[example])[1].id"),deck.id)});
test("shortcut-fields",8,c=>{c.event={key:"1",code:"Digit1",target:{matches:()=>true},preventDefault(){}};go(c,'currentScreen="study";studyRound={position:0,cards:[{}]};var changed=0;markAnswer=function(){changed++};studyKeys(event)');assert.equal(go(c,"changed"),0)});
console.log(passed+" checks passed");
if(!passed&&!process.exitCode)process.exitCode=2;
