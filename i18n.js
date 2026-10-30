(function(g){
  'use strict';
  const supported=['ko','en','zh','ja'],data=g.ScentLocaleData||{};
  let language='ko';
  try{const requested=new URL(location.href).searchParams.get('lang');const saved=localStorage.getItem('books-scents-language');language=supported.includes(requested)?requested:supported.includes(saved)?saved:'ko';}catch{}
  const phrases=Object.keys(data).filter(k=>k.length>1).sort((a,b)=>b.length-a.length);
  const reverse=new Map();for(const [key,values] of Object.entries(data))for(const value of Object.values(values))if(!reverse.has(value))reverse.set(value,key);
  const select=(en,zh,ja)=>({en,zh,ja})[language];
  function blendNotes(value){
    const shared=value.match(/^([^의]+?)(?:과|와) ([^의]+?)의 (.+)$/);
    if(shared){const a=text(shared[1]),b=text(shared[2]),quality=text(shared[3]);return select(`the ${quality.toLowerCase()} of ${a.toLowerCase()} and ${b.toLowerCase()}`,`${a}与${b}的${quality}`,`${a}と${b}の${quality}`);}
    return value.split(/[과와] /).map(text).join(select(' and ','与','と'));
  }
  function text(source){
    if(source==null)return '';const original=String(source);if(language==='ko')return original;
    const key=original.trim().replace(/\s+/g,' ');if(!key)return original;
    if(data[key]?.[language])return original.replace(original.trim(),data[key][language]);
    let m;
    if((m=key.match(/^(.*?)에 (.*?)(?:이|가) 어우러져, (.*?)\.$/))){const base=text(m[1]),notes=blendNotes(m[2]),ending=text(m[3]);return select(`A blend of ${base.toLowerCase()} and ${notes}, with ${ending}.`,`${base}融入${notes}，带来${ending}。`,`${base}に${notes}を重ね、${ending}。`);}
    if((m=key.match(/^(.*?)(?:이|가) 중심을 이루며, (.*?)\.$/))){const base=text(m[1]),ending=text(m[2]);return select(`${base}, with ${ending}.`,`${base}为主调，呈现${ending}。`,`${base}を中心に、${ending}。`);}
    if((m=key.match(/^(.*?)에 (.*?)을 더한, (.*?) 향\.$/))){const main=text(m[1]),notes=m[2].split('과 ').map(text),mood=text(m[3]);return select(`${main}, with ${notes.join(' and ')}: a ${mood} scent.`,`${main}，加入${notes.join('与')}，呈现${mood}的香气。`,`${main}に${notes.join('と')}を重ねた、${mood}香り。`);}
    if((m=key.match(/^(.*?)을 담은, (.*?) 향\.$/)))return select(`${text(m[1])}: a ${text(m[2])} scent.`,`${text(m[1])}，呈现${text(m[2])}的香气。`,`${text(m[1])}を込めた、${text(m[2])}香り。`);
    if((m=key.match(/^(\d+)개 선택$/)))return select(`${m[1]} selected`,`已选${m[1]}种`,`${m[1]}個選択`);
    if((m=key.match(/^(\d+)개$/)))return select(`${m[1]} scents`,`${m[1]}种`,`${m[1]}種類`);
    if((m=key.match(/^메인향 1개 · 단일향 (\d+)개$/)))return select(`1 main scent · ${m[1]} single notes`,`1款主香 · ${m[1]}种单香`,`メイン1種類・単香${m[1]}種類`);
    if((m=key.match(/^(\d+) \/ (\d+) 페이지 · 메모 (\d+)개$/)))return select(`Page ${m[1]} / ${m[2]} · ${m[3]} notes`,`${m[1]} / ${m[2]} 页 · ${m[3]}张留言`,`${m[1]} / ${m[2]}ページ・メモ${m[3]}件`);
    if((m=key.match(/^추천 (\d+)$/)))return select(`Pick ${m[1]}`,`推荐 ${m[1]}`,`おすすめ ${m[1]}`);
    if((m=key.match(/^오늘 방문 (\d+) · 조회 (\d+) · 방문 예약 링크 클릭 (\d+)회$/)))return select(`Today: ${m[1]} visitors · ${m[2]} views · ${m[3]} booking-link clicks`,`今日访客${m[1]} · 浏览${m[2]} · 预约链接点击${m[3]}次`,`今日の訪問${m[1]}・閲覧${m[2]}・予約リンククリック${m[3]}回`);
    if((m=key.match(/^공감 (\d+)개(, 취소하기)?$/)))return select(`${m[1]} hearts${m[2]?', undo':''}`,`${m[1]}个赞${m[2]?'，取消':''}`,`ハート${m[1]}個${m[2]?'、取り消す':''}`);
    if((m=key.match(/^댓글 (\d+)$/)))return select(`Comments ${m[1]}`,`评论 ${m[1]}`,`コメント ${m[1]}`);
    if((m=key.match(/^(.+)님의 메모 삭제$/)))return select(`Delete note by ${m[1]}`,`删除${m[1]}的留言`,`${m[1]}さんのメモを削除`);
    if((m=key.match(/^(.+)의 이미지를 연결했어요\.$/)))return select(`${text(m[1])} evokes this story.`,`${text(m[1])}呼应故事意象。`,`${text(m[1])}のイメージをつなげました。`);
    if((m=key.match(/^(.+) 분위기에 어울리는 후보$/)))return select(`A match for ${text(m[1])}`,`适合${text(m[1])}氛围`,`${text(m[1])}の雰囲気に合う候補`);
    if((m=key.match(/^(.+) 노트 구성 어코드 확인$/)))return select(`Notes and accords of ${text(m[1])}`,`查看${text(m[1])}的香调与香韵`,`${text(m[1])}のノートとアコード`);
    let result=key.replace(/(\d+)번/g,'$1');for(const phrase of phrases)if(result.includes(phrase))result=result.split(phrase).join(data[phrase][language]);
    result=result.replace(/(^|[ ·,/:()])([가-힣])(?=$|[ ·,/:()])/g,(whole,boundary,note)=>boundary+(data[note]?.[language]||note));
    return original.replace(original.trim(),result);
  }
  const brandAliases={'Chanel':'香奈儿 シャネル','Dior':'迪奥 ディオール','Jo Malone':'祖玛珑 ジョーマローン','Gucci':'古驰 グッチ','Le Labo':'勒莱柏 ルラボ','Diptyque':'蒂普提克 ディプティック','Creed':'信仰 クリード','Byredo':'百瑞德 バイレード','Tom Ford':'汤姆福特 トムフォード','Hermès':'爱马仕 エルメス','Aesop':'伊索 イソップ','Victoria':'维多利亚的秘密 ヴィクトリアズシークレット'};
  function searchText(name){const en=data[name]?.en||name;return [name,en,...Object.entries(brandAliases).filter(([brand])=>en.includes(brand)).map(([,aliases])=>aliases)].join(' ');}
  const nodeSources=new WeakMap(),attributeSources=new WeakMap();
  const skip='script,style,code,[data-no-i18n],#feedback-notes .note-body,#feedback-notes .note-bottom>span,.feedback-comment strong,.feedback-comment p,#feedback-thread-note,.language-picker option';
  function sourceFor(node,current,map){let record=map.get(node);if(!record||current!==record.last){record={source:reverse.get(current.trim())||current,last:current};map.set(node,record);}return record;}
  function walk(root){
    if(root.nodeType===3){if(root.parentElement?.closest(skip))return;const record=sourceFor(root,root.nodeValue,nodeSources);const output=text(record.source);if(root.nodeValue!==output)root.nodeValue=output;record.last=output;return;}
    if(root.nodeType!==1&&root.nodeType!==9)return;
    if(root.nodeType===1){if(root.matches(skip))return;
      let attrs=attributeSources.get(root);if(!attrs){attrs={};attributeSources.set(root,attrs);}
      for(const name of ['placeholder','aria-label','title','alt']){if(!root.hasAttribute(name))continue;const current=root.getAttribute(name);let record=attrs[name];if(!record||current!==record.last)record=attrs[name]={source:current,last:current};const output=text(record.source);if(current!==output)root.setAttribute(name,output);record.last=output;}
      if(root.matches('a[data-reservation]')&&!root.querySelector('.naver-reservation-mark')){const icon=document.createElement('span');icon.className='naver-reservation-mark';icon.setAttribute('aria-hidden','true');icon.innerHTML='<svg viewBox="0 0 20 22"><path fill="white" d="M0 0h6l8 12V0h6v22h-6L6 10v12H0Z"/></svg>';root.prepend(icon);}
    }
    for(const child of [...root.childNodes])walk(child);
  }
  let observer;
  function apply(){if(typeof document==='undefined')return;observer?.disconnect();document.documentElement.lang=language;walk(document.documentElement);const select=document.getElementById('language-select');if(select)select.value=language;observer?.observe(document.documentElement,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['placeholder','aria-label','title','alt']});}
  function setLanguage(value){if(!supported.includes(value))return;language=value;try{localStorage.setItem('books-scents-language',value);const url=new URL(location.href);if(value==='ko')url.searchParams.delete('lang');else url.searchParams.set('lang',value);history.replaceState(null,'',url.pathname+url.search+url.hash);}catch{}apply();}
  g.ScentI18n={text,searchText,setLanguage,get lang(){return language;}};
  if(typeof document==='undefined')return;
  observer=new MutationObserver(records=>{observer.disconnect();for(const record of records){if(record.type==='childList')for(const node of record.addedNodes)walk(node);else walk(record.target);}observer.observe(document.documentElement,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['placeholder','aria-label','title','alt']});});
  apply();document.getElementById('language-select')?.addEventListener('change',e=>setLanguage(e.target.value));
})(globalThis);
