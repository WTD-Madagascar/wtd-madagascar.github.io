document.addEventListener("DOMContentLoaded",()=>{

const dangerBtn=document.getElementById("dangerBtn");
const out=document.getElementById("dangerOutput");

if(dangerBtn){
 dangerBtn.onclick=()=>{
  out.innerHTML=`
  <p>Montrez ce message :</p>
  <p><b>Je suis en difficulté. Pouvez-vous appeler les secours ?</b></p>
  <p class="small">Sahirana aho. Azafady miantsoa vonjy.</p>
  <a href="tel:124">📞 Police 124</a><br>
  <a href="tel:118">🚑 Urgences 118</a>
  `;
 };
}

const blackBtn=document.getElementById("blackModeBtn");
const black=document.getElementById("blackScreen");
const exit=document.getElementById("exitBlackMode");

if(blackBtn){
 blackBtn.onclick=()=>black.hidden=false;
 exit.onclick=()=>black.hidden=true;
}

const smsBtn=document.getElementById("smsHelpBtn");
const smsOut=document.getElementById("smsOutput");

if(smsBtn){
 smsBtn.onclick=()=>{
  const msg="❗ Besoin d’aide.\n❗ Mila fanampiana aho.";
  smsOut.innerHTML=`
  <p>${msg.replace(/\n/g,"<br>")}</p>
  <a href="sms:?body=${encodeURIComponent(msg)}">📤 Ouvrir SMS</a>
  `;
 };
}

});
