export function campInviteURL(href=location.href){
 const url=new URL('/archive/',href);url.searchParams.set('start','camp');return url.href;
}
export async function shareCampInvite({notify=()=>{},nav=navigator,doc=document,href=location.href}={}){
 const url=campInviteURL(href),data={title:'책과향기 · 별빛 캠핑장 초대',text:'잠깐 쉬어갈래요? 별빛 아래 함께 불멍해요.',url};
 try{if(nav.share){await nav.share(data);return 'shared';}}catch(e){if(e.name==='AbortError')return 'cancelled';}
 try{if(nav.clipboard?.writeText)await nav.clipboard.writeText(url);else throw Error('clipboard');}
 catch{const field=doc.createElement('textarea');field.value=url;field.style.cssText='position:fixed;top:0;left:0;width:1px;height:1px;opacity:0';doc.body.append(field);field.select();const ok=doc.execCommand('copy');field.remove();if(!ok){notify('링크를 복사해 초대해 주세요: '+url);return 'unavailable';}}
 notify('불멍 초대 링크를 복사했어요. 카카오톡이나 메시지에 붙여넣어 주세요.');return 'copied';
}
