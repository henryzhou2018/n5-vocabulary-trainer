"use strict";
const $=id=>document.getElementById(id);
let history=[],index=-1,deck=[],running=false,phase='idle',timer=null,startedAt=0,duration=0,remaining=0,token=0;
const saved=(()=>{try{return JSON.parse(localStorage.getItem('n5prefs')||'{}')}catch{return {}}})();
for(const id of ['reveal','nextdelay'])if(saved[id])$(id).value=saved[id];
for(const id of ['autoaudio','showreading'])if(typeof saved[id]==='boolean')$(id).checked=saved[id];
function save(){let o={};for(const id of ['reveal','nextdelay'])o[id]=$(id).value;for(const id of ['autoaudio','showreading'])o[id]=$(id).checked;try{localStorage.setItem('n5prefs',JSON.stringify(o))}catch{}}
function seconds(id){let n=Number($(id).value);return Number.isFinite(n)?Math.max(1,Math.min(120,n)):5}
function shuffle(){deck=WORDS.map((_,i)=>i);for(let i=deck.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]]}}
function pick(){if(!deck.length)shuffle();return deck.pop()}
function cancel(){clearTimeout(timer);timer=null;token++;$('progress').style.width='0%'}
function stopSpeech(){if('speechSynthesis' in window)window.speechSynthesis.cancel()}
function say(){if(!('speechSynthesis' in window)||index<0)return;$('status').textContent=running?'学习中':'已暂停';stopSpeech();let u=new SpeechSynthesisUtterance(WORDS[history[index]].r);u.lang='ja-JP';u.rate=.85;let voices=window.speechSynthesis.getVoices();let v=voices.find(x=>x.lang.toLowerCase().startsWith('ja'));if(v)u.voice=v;window.speechSynthesis.speak(u)}
function render(){if(index<0)return;let w=WORDS[history[index]];$('word').textContent=w.j;$('reading').textContent=w.r;$('meaning').textContent=w.c;$('reading').classList.add('hidden');$('meaning').classList.add('hidden');$('hint').textContent='先想一想它的意思…';$('count').textContent=`${index+1} / ${WORDS.length} 词`;}
function reveal(){if(index<0)return;phase='answer';$('meaning').classList.remove('hidden');if($('showreading').checked)$('reading').classList.remove('hidden');$('hint').textContent='中文释义已显示';if(running)schedule(seconds('nextdelay')*1000,advance)}
function schedule(ms,callback){cancel();remaining=ms;duration=ms;startedAt=Date.now();let t=token;timer=setTimeout(()=>{if(t!==token)return;callback()},ms)}
function load(){cancel();stopSpeech();render();phase='question';if(running){if($('autoaudio').checked)say();schedule(seconds('reveal')*1000,reveal)}}
function advance(){if(!WORDS.length){$('status').textContent='请先添加单词';return}if(index<history.length-1)index++;else{history.push(pick());index++}load()}
function back(){if(index>0){index--;load()}}
function toggle(){if(!running){running=true;$('toggle').textContent='⏸ 暂停';if(index<0)advance();else if(phase==='answer')schedule(seconds('nextdelay')*1000,advance);else{if($('autoaudio').checked)say();schedule(seconds('reveal')*1000,reveal)}$('status').textContent='学习中'}else{running=false;cancel();stopSpeech();$('toggle').textContent='▶ 继续';$('status').textContent='已暂停'}}
$('toggle').onclick=toggle;$('next').onclick=()=>{if(index<0){running=true;$('toggle').textContent='⏸ 暂停'}advance()};$('prev').onclick=back;$('show').onclick=()=>{if(index<0)return;cancel();reveal()};$('speak').onclick=say;
for(const id of ['reveal','nextdelay','autoaudio','showreading'])$(id).addEventListener('change',()=>{save();if(id==='showreading'&&phase==='answer')$('reading').classList.toggle('hidden',!$('showreading').checked)});
setInterval(()=>{if(!running||!timer)return;let pct=Math.min(100,(Date.now()-startedAt)/duration*100);$('progress').style.width=pct+'%'},100);
window.addEventListener('keydown',e=>{if(['INPUT','TEXTAREA'].includes(document.activeElement.tagName))return;if(e.key==='ArrowLeft')back();if(e.key==='ArrowRight')advance();if(e.key===' '){e.preventDefault();if(index>=0){cancel();reveal()}}});
$('count').textContent=WORDS.length+' 词';
if('serviceWorker' in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js').catch(()=>{});

window.refreshTrainerBank=function(){cancel();stopSpeech();running=false;phase='idle';history=[];index=-1;deck=[];$('toggle').textContent='▶ 开始';$('word').textContent='准备好了吗？';$('reading').textContent='';$('meaning').textContent='';$('reading').classList.add('hidden');$('meaning').classList.add('hidden');$('hint').textContent='点击「开始」学习';$('status').textContent='词库已更新';$('count').textContent=WORDS.length+' 词';};
