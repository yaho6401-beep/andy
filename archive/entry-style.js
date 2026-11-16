/* Lightweight vector portraits; no extra WebGL canvas or downloaded artwork. */
(function(){
 const names=['데일리','안경','포인트','산책','보브','롱헤어','번헤어','트윈'];
 function portrait(i,color='#b7c6a1',hair='#554239'){
 const skins=['#edc5aa','#bf8b6d','#e5bfa7','#d3a58a'];
 const skin=skins[i%4];
 return `<svg viewBox="0 0 80 84" aria-hidden="true"><ellipse cx="40" cy="77" rx="23" ry="4" fill="#202020" opacity=".07"/><path d="M22 78V65Q22 52 40 52T58 65V78" fill="${color}"/><path d="M27 58Q40 66 53 58" fill="none" stroke="#fffaf3" stroke-width="4"/><rect x="16" y="13" width="48" height="${i>=4?'51':'39'}" rx="23" fill="${hair}"/><circle cx="40" cy="35" r="22" fill="${skin}"/><path d="M18 30Q16 7 40 10Q64 9 62 30Q49 27 42 19Q35 31 18 30" fill="${hair}"/><ellipse cx="31" cy="37" rx="2.7" ry="3.5" fill="#302c30"/><ellipse cx="49" cy="37" rx="2.7" ry="3.5" fill="#302c30"/><circle cx="30" cy="36" r=".9" fill="white"/><circle cx="48" cy="36" r=".9" fill="white"/><ellipse cx="24" cy="44" rx="4" ry="2" fill="#dc9995" opacity=".7"/><ellipse cx="56" cy="44" rx="4" ry="2" fill="#dc9995" opacity=".7"/><path d="M36 46Q40 50 44 46" stroke="#936b61" stroke-width="1.8" fill="none" stroke-linecap="round"/>${i%4===1?'<g fill="none" stroke="#685a4b" stroke-width="1.8"><circle cx="30" cy="38" r="8"/><circle cx="50" cy="38" r="8"/><path d="M38 38h4"/></g>':''}${i===6?`<circle cx="44" cy="10" r="8" fill="${hair}"/>`:''}${i%4===2?'<path d="m55 22 7 4" stroke="#e3bc6e" stroke-width="4" stroke-linecap="round"/>':''}${i===7?`<ellipse cx="16" cy="50" rx="6" ry="12" fill="${hair}"/><ellipse cx="64" cy="50" rx="6" ry="12" fill="${hair}"/>`:''}</svg>`;
 }
 window.ArchivePortrait={names,portrait};
 const choices=document.getElementById('avatar-kinds');
 if(choices)choices.innerHTML=names.map((name,i)=>`<button type="button" data-kind="${i}" aria-label="${name}" aria-pressed="${i===0}">${portrait(i)}<span>${name}</span></button>`).join('');
})();
