const outcomes=[1.42, 2.18, 1.07, 3.64, 1.31, 1.88, 5.12, 1.16, 2.73, 1.54, 4.21, 1.09, 2.46, 1.67, 3.18];
let balance=10000, index=0, running=false, cashed=false, stake=100, timer=null, multiplier=1;
const $=id=>document.getElementById(id);
const balanceEl=$('balance'), mult=$('multiplier'), plane=$('plane'), crash=$('crash'), status=$('status');
const betBtn=$('bet'), cashBtn=$('cashout'), stakeEl=$('stake'), trajectory=$('trajectory');

function money(n){return n.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}
function beep(freq=440,duration=.08){
  try{const C=window.AudioContext||window.webkitAudioContext;const c=new C(),o=c.createOscillator(),g=c.createGain();o.frequency.value=freq;o.type='sine';g.gain.value=.04;o.connect(g);g.connect(c.destination);o.start();g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+duration);o.stop(c.currentTime+duration)}catch(e){}
}
function renderHistory(){ /* Deliberately keeps the UI generic and does not expose the scripted dataset. */ }
function resetVisual(){
  clearInterval(timer);running=false;cashed=false;multiplier=1;
  mult.textContent='1.00x';plane.style.left='9%';plane.style.bottom='18%';plane.style.transform='rotate(-14deg)';
  crash.style.display='none';trajectory.style.width='0';trajectory.style.height='0';
  status.textContent='WAITING';betBtn.disabled=false;cashBtn.disabled=true;
}
function startRound(){
  if(running)return;
  stake=Math.max(1,Number(stakeEl.value)||1);
  if(stake>balance){openModal('Insufficient virtual balance','Increase the virtual balance or use a smaller stake.');return}
  balance-=stake;balanceEl.textContent=money(balance);running=true;cashed=false;
  betBtn.disabled=true;cashBtn.disabled=false;status.textContent='FLYING';beep(520,.06);
  const target=outcomes[index]; const duration=1900+target*900; const start=performance.now();
  timer=setInterval(()=>{
    const p=Math.min(1,(performance.now()-start)/duration);
    multiplier=1+(target-1)*p;
    mult.textContent=multiplier.toFixed(2)+'x';
    plane.style.left=(9+Math.min(78,p*78))+'%';
    plane.style.bottom=(18+Math.min(55,p*55))+'%';
    plane.style.transform='rotate(-'+(14-Math.min(7,p*7))+'deg)';
    trajectory.style.width=(12+p*88)+'%'; trajectory.style.height=(4+p*88)+'%';
    if(p>=1)crashRound();
  },30);
}
function crashRound(){
  clearInterval(timer);running=false;cashBtn.disabled=true;
  mult.textContent=outcomes[index].toFixed(2)+'x';status.textContent='CRASH';
  crash.style.display='block';beep(120,.2);beep(80,.25);
  setTimeout(()=>{index=(index+1)%outcomes.length;resetVisual();},1100);
}
function cashOut(){
  if(!running||cashed)return;cashed=true;const payout=stake*multiplier;balance+=payout;
  balanceEl.textContent=money(balance);cashBtn.disabled=true;status.textContent='CASHED OUT';beep(760,.12);
}
function openModal(t,m){$('modalTitle').textContent=t;$('modalText').textContent=m;$('modal').style.display='flex'}
$('deposit').onclick=()=>openModal('Virtual Deposit','This demonstration uses virtual credits only. No real money is transferred.');
$('withdraw').onclick=()=>openModal('Virtual Withdrawal','Withdrawal is simulated for the classroom demonstration. No real money is transferred.');
$('closeModal').onclick=()=>$('modal').style.display='none';
betBtn.onclick=startRound;cashBtn.onclick=cashOut;
stakeEl.addEventListener('change',()=>{if(stakeEl.value<1)stakeEl.value=1});
resetVisual();
