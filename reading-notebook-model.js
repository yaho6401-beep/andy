// Shared by the private record validator and the browser. No HTML is stored.
export const QUOTE_LIMIT=4000;
export function cleanNotebook(value){
 const text=(v,max)=>typeof v==='string'?v.replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g,'').trim().slice(0,max):'';
 if(typeof value?.quote!=='string'||!value.quote.trim())throw Error('옮겨 적을 문장을 골라주세요.');
 if(value.quote.length>QUOTE_LIMIT)throw Error('한 페이지에는 4,000자까지 담을 수 있어요. 나누어 옮겨주세요.');
 const quote=text(value.quote,QUOTE_LIMIT);if(!quote)throw Error('옮겨 적을 문장을 확인해 주세요.');
 let sourceUrl='',licenseUrl='';
 for(const key of ['sourceUrl','licenseUrl']){try{const u=new URL(value[key]);if(u.protocol==='https:'&&!u.username&&!u.password&&u.href.length<=600){if(key==='sourceUrl')sourceUrl=u.href;else licenseUrl=u.href;}}catch{}}
 return {quote,title:text(value.title,160)||'내가 옮겨 적은 한 페이지',sourceTitle:text(value.sourceTitle,200)||'직접 옮겨 적은 글',location:text(value.location,180),author:text(value.author,120),credit:text(value.credit,600),sourceUrl,licenseUrl,note:text(value.note,1000)};
}
export function sentences(text,locale='ko'){
 const value=String(text??'');if(!value)return [];
 if(typeof Intl.Segmenter==='function')return [...new Intl.Segmenter(locale,{granularity:'sentence'}).segment(value)].map(s=>s.segment);
 return value.match(/[^.!?。！？\n]+(?:[.!?。！？]+[”’"']*\s*|$)|\n+/g)||[value];
}
export function excerptUnits(chapter,bible,locale='ko'){
 return bible?(chapter.verses||[]).map(v=>({key:'v'+v.verse,text:v.text,label:v.verse+'절'})):(chapter.paragraphs||[]).flatMap((p,i)=>sentences(p,locale).map((text,j)=>({key:'p'+i+'s'+j,text,label:'문장 '+(j+1),paragraph:i})));
}
export function selectedExcerpt(units,keys){return units.filter(u=>keys.has(u.key)).map(u=>u.text.trim()).join('\n\n');}
