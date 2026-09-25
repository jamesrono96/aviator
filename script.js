const OUTCOMES=[1.42, 2.18, 1.07, 3.64, 1.31, 1.88, 5.12, 1.16, 2.73, 1.54, 4.21, 1.09, 2.46, 1.67, 3.18];
let currentIndex=0,balance=10000,running=false,timerId=null,countId=null,entries=[],queued=[],history=[];
const el=id=>document.getElementById(id);
const money=n=>Number(n).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
function renderAuth(register=false){
 const f=el("authForm");
 f.innerHTML='<div class="form"><label>Phone number</label><input id="phone" placeholder="+254 7XX XXX XXX"><label>Password</label><input id="password" type="password" placeholder="Password">'+(register?'<label>Confirm password</label><input id="password2" type="password" placeholder="Confirm password">':'')+'<button class="submit" id="authSubmit">'+(register?'Create account':'Login')+'</button></div>';
 el("authSubmit").onclick=()=>{const phone=el("phone").value.trim(),pw=el("password").value;if(!phone||!pw)return alert("Enter your phone number and password.");if(register&&pw!==el("password2").value)return alert("Passwords do not match.");renderOtp(phone)};
}
function renderOtp(phone){
 el("authForm").innerHTML='<div class="form"><label>One-time code</label><input id="otp" maxlength="6" inputmode="numeric" placeholder="Enter code"><div class="otp">Demo code: 246810</div><button class="submit" id="verify">Verify & continue</button></div>';
 el("verify").onclick=()=>{if(el("otp").value!=="246810")return alert("Incorrect code.");el("userPhone").textContent=phone;el("authScreen").hidden=true;el("app").hidden=false;beginNextRound()};
}
el("loginTab").onclick=()=>{el("loginTab").classList.add("active");el("registerTab").classList.remove("active");renderAuth(false)};
el("registerTab").onclick=()=>{el("registerTab").classList.add("active");el("loginTab").classList.remove("active");renderAuth(true)};
renderAuth(false);
function beep(freq,dur){try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;const a=new AC(),o=a.createOscillator(),g=a.createGain();o.frequency.value=freq;g.gain.value=.035;o.connect(g);g.connect(a.destination);o.start();o.stop(a.currentTime+dur)}catch(e){}}
function renderEntries(){
 el("balance").textContent=money(balance);
 el("entries").innerHTML=entries.map((e,i)=>'<div class="entry"><input placeholder="Entry '+(i+1)+'" value="'+(e.name||"")+'" data-name="'+i+'"><input type="number" min="1" value="'+(e.amount||100)+'" data-amount="'+i+'"><div class="cashValue">'+(running?money((e.amount||0)*Number(el("multiplier").textContent.replace("x",""))):"—")+'</div><button class="remove" data-remove="'+i+'">×</button></div>').join("");
 document.querySelectorAll("[data-name]").forEach(x=>x.oninput=()=>entries[+x.dataset.name].name=x.value);
 document.querySelectorAll("[data-amount]").forEach(x=>x.oninput=()=>entries[+x.dataset.amount].amount=Number(x.value));
 document.querySelectorAll("[data-remove]").forEach(x=>x.onclick=()=>{entries.splice(+x.dataset.remove,1);renderEntries()});
}
el("addEntry").onclick=()=>{if(entries.length>=5)return alert("Maximum 5 entries.");entries.push({name:"",amount:100});renderEntries()};
function resetVisual(){el("multiplier").textContent="1.00x";el("plane").style.left="4%";el("plane").style.bottom="8%";el("plane").style.transform="rotate(-16deg)";el("trail").style.width="0";el("trail").style.height="0";el("crash").style.display="none";renderEntries()}
function beginNextRound(){resetVisual();el("state").textContent="NEXT ROUND";let n=2;el("roundClock").textContent="STARTING "+n;clearInterval(countId);countId=setInterval(()=>{n--;if(n<=0){clearInterval(countId);startRound()}else el("roundClock").textContent="STARTING "+n},600)}
function startRound(){
 if(queued.length){entries=queued;queued=[]}
 const total=entries.reduce((s,e)=>s+Math.max(0,Number(e.amount)||0),0);
 if(total>balance){alert("Insufficient balance.");entries=[];renderEntries();return beginNextRound()}
 balance-=total;renderEntries();running=true;el("state").textContent="FLYING";el("roundClock").textContent="IN PLAY";beep(520,.07);
 const target=OUTCOMES[currentIndex],start=performance.now(),duration=3000+target*850;
 clearInterval(timerId);timerId=setInterval(()=>{const p=Math.min(1,(performance.now()-start)/duration),m=1+(target-1)*p;
 el("multiplier").textContent=m.toFixed(2)+"x";el("plane").style.left=(4+90*p)+"%";el("plane").style.bottom=(8+76*p)+"%";el("plane").style.transform="rotate(-"+(16-9*p)+"deg)";el("trail").style.width=(20+95*p)+"%";el("trail").style.height=(5+95*p)+"%";renderEntries();if(p>=1)crashRound()},25)
}
function crashRound(){clearInterval(timerId);running=false;el("state").textContent="CRASH";el("roundClock").textContent="NEXT ROUND";el("multiplier").textContent=OUTCOMES[currentIndex].toFixed(2)+"x";el("crash").style.display="block";beep(120,.18);beep(75,.22);history.unshift(OUTCOMES[currentIndex]);history=history.slice(0,7);el("history").innerHTML=history.map(x=>'<div class="r"><span>Completed</span><span>'+x.toFixed(2)+'x</span><span>Crash</span></div>').join("");currentIndex=(currentIndex+1)%OUTCOMES.length;entries=[];renderEntries();setTimeout(beginNextRound,900)}
el("placeBets").onclick=()=>{if(!entries.length){el("addEntry").click();return}if(running){queued=entries.map(e=>({...e}));entries=[];el("state").textContent="QUEUED FOR NEXT ROUND";renderEntries()}else startRound()};
function wallet(type){el("modalTitle").textContent=type;el("modalText").textContent="Enter amount";el("modalAmount").value="";el("modal").style.display="flex";el("modalConfirm").onclick=()=>{const n=Number(el("modalAmount").value);if(!n||n<1)return;if(type==="Deposit")balance+=n;else balance=Math.max(0,balance-n);el("modal").style.display="none";renderEntries()}}
el("deposit").onclick=()=>wallet("Deposit");el("withdraw").onclick=()=>wallet("Withdraw");el("modalCancel").onclick=()=>el("modal").style.display="none";
entries.push({name:"",amount:100});renderEntries();