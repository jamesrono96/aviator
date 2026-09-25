const rounds = [{"round": 1, "outcome": 1.42}, {"round": 2, "outcome": 2.18}, {"round": 3, "outcome": 1.07}, {"round": 4, "outcome": 3.64}, {"round": 5, "outcome": 1.31}, {"round": 6, "outcome": 1.88}, {"round": 7, "outcome": 5.12}, {"round": 8, "outcome": 1.16}, {"round": 9, "outcome": 2.73}, {"round": 10, "outcome": 1.54}, {"round": 11, "outcome": 4.21}, {"round": 12, "outcome": 1.09}, {"round": 13, "outcome": 2.46}, {"round": 14, "outcome": 1.67}, {"round": 15, "outcome": 3.18}];
let current=0, timer=null;
const roundNo=document.getElementById('roundNo'), statusEl=document.getElementById('status');
const mult=document.getElementById('multiplier'), bar=document.getElementById('bar');
const start=document.getElementById('start'), next=document.getElementById('next'), reset=document.getElementById('reset');
const tbody=document.getElementById('tableBody');

function renderTable(){
  tbody.innerHTML='';
  rounds.forEach((x,i)=>{
    const tr=document.createElement('tr');
    tr.innerHTML=`<td>${x.round}</td><td>${x.outcome.toFixed(2)}x</td><td class="${i<current?'done':i===current?'current':''}">${i<current?'COMPLETED':i===current?'CURRENT':'PENDING'}</td>`;
    tbody.appendChild(tr);
  });
}
function resetUI(){
  clearInterval(timer); current=0; roundNo.textContent='1'; statusEl.textContent='READY';
  mult.textContent='1.00x'; bar.style.width='0%'; start.disabled=false; next.disabled=true; renderTable();
}
function runRound(){
  if(current>=rounds.length) return;
  start.disabled=true; next.disabled=true; statusEl.textContent='RUNNING';
  let x=1.00, target=rounds[current].outcome;
  let steps=35, i=0;
  timer=setInterval(()=>{
    i++; x=1 + (target-1)*(i/steps);
    mult.textContent=x.toFixed(2)+'x'; bar.style.width=(i/steps*100)+'%';
    if(i>=steps){
      clearInterval(timer); mult.textContent=target.toFixed(2)+'x'; statusEl.textContent='SCRIPTED OUTCOME';
      next.disabled=false; renderTable();
    }
  },45);
}
start.onclick=runRound;
next.onclick=()=>{
  if(current<rounds.length-1){current++; roundNo.textContent=current+1; mult.textContent='1.00x'; bar.style.width='0%'; statusEl.textContent='READY'; start.disabled=false; next.disabled=true; renderTable();}
  else {statusEl.textContent='SEQUENCE COMPLETE'; next.disabled=true; renderTable();}
};
reset.onclick=resetUI;
renderTable();
