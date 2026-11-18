// Each owned AI photographic atlas is five equal columns by two equal rows.
export function ingredientPhotoHTML(s,full=false,revealed=false){
 if(!/^[TML](?:10|[1-9])$/.test(s.code))return '';
 const i=Number(s.code.slice(1))-1,zone={T:'top',M:'middle',L:'base'}[s.code[0]],label=revealed?s.code+' '+s.name:s.code+' 향을 떠올리는 이미지';
 const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const photo=s.code==='T1'?"background-image:url('/assets/ingredient-photos/t1-soft-v2.jpg');background-position:center;background-size:cover;":`background-image:url('/assets/ingredient-photos/${zone}-materials.jpg');background-position:${(i%5)*25}% ${i<5?0:100}%;`;
 return `<figure class="ingredient-photo ${full?'ingredient-photo-full':'ingredient-photo-brief'}"><div role="img" aria-label="${esc(label)}" style="${photo}"></div><figcaption>AI 연출 이미지</figcaption></figure>`;
}
