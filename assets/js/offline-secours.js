fetch("../data/offline-secours.json")
.then(r=>r.json())
.then(d=>{
 document.getElementById("offlineSecours").innerHTML=`
 <p><b>${d.messages.fr.text}</b></p>
 <p class="small">${d.messages.mg.text}</p>
 <ul>${d.emergency_numbers.map(n=>`<li>${n.label} : ${n.number}</li>`).join("")}</ul>
 `;
});
