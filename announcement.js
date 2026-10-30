(function(){
 'use strict';
 const dialog=document.getElementById('solo-announcement');if(!dialog)return;
 const key='books-scents-solo-announcement-20261030',parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()),part=t=>parts.find(p=>p.type===t).value,today=part('year')+'-'+part('month')+'-'+part('day');
 let attempted=false,goToLounge=false,overflow='';
 function open(){if(attempted||document.hidden)return;attempted=true;try{if(localStorage.getItem(key)===today)return;}catch{}if(document.querySelector('dialog[open]'))return;overflow=document.documentElement.style.overflow;document.documentElement.style.overflow='hidden';dialog.showModal();}
 document.getElementById('solo-announcement-link').addEventListener('click',()=>{goToLounge=true;dialog.close();});
 dialog.querySelectorAll('[data-announcement-close]').forEach(b=>b.addEventListener('click',()=>dialog.close()));
 dialog.addEventListener('close',()=>{if(document.getElementById('solo-announcement-today').checked){try{localStorage.setItem(key,today);}catch{}}document.documentElement.style.overflow=overflow;if(goToLounge){goToLounge=false;document.querySelector('[data-lounge="community"]').click();}});
 setTimeout(open,650);document.addEventListener('visibilitychange',open);
})();
