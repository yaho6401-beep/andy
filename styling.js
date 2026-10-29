(function(root){
  'use strict';
  const items={
    top:[['베르가못 브로치','citrus','#91ad53','brooch'],['자몽 귀고리','citrus','#ee917e','ear'],['그린티 찻잔','tea','#8aa875','prop'],['사과 참 백','apple','#d76963','bag'],['레몬 귀고리','citrus','#e7cc55','ear'],['만다린 팔찌','citrus','#e9a45a','bracelet'],['청포도 소품','grape','#a0b96e','prop'],['딸기 목걸이','berry','#cf6d77','neck'],['모과 오브제','apple','#d5be64','prop'],['블랙체리 귀고리','cherry','#914555','ear']],
    middle:[['장미 브로치','rose','#c77d91','brooch'],['라일락 헤어핀','flower','#b498c6','hair'],['자스민 목걸이','flower','#eee6c9','neck'],['일랑일랑 귀고리','flower','#debd59','ear'],['마린 조개 목걸이','shell','#9bbdc9','neck'],['아카시아 꽃 참','flower','#e8d8a1','bag'],['라벤더 꽃다발','sprig','#a294bd','prop'],['유칼립투스 화병','leaf','#80a69a','prop'],['카네이션 코사지','rose','#d49698','brooch'],['바이올렛 리프 헤어핀','leaf','#92a17a','hair']],
    base:[['모스 테라리움','terrarium','#819065','prop'],['패츌리 잎 브로치','leaf','#738460','brooch'],['샌달우드 우드 뱅글','ring','#bc9a75','bracelet'],['시더우드 우드 참','wood','#ac8569','bag'],['화이트 머스크 진주 목걸이','pearl','#eee9dc','neck'],['앰버 보석 반지','gem','#c89750','bracelet'],['바닐라 리본','ribbon','#ddc89e','hair'],['코튼 블라썸 코사지','cotton','#eee9dc','brooch'],['베이비 파우더 파우치','pouch','#d3b9c7','prop'],['밤부 오브제','bamboo','#93a877','prop']]
  };
  function descriptor(s){const i=items[s.note]?.[s.number-1];return i?{id:s.id,label:i[0],motif:i[1],color:i[2],place:i[3]}:null;}
  function motif(d){
    const c=d.color;
    const shapes={
      citrus:`<circle r="10" fill="${c}"/><circle r="7" fill="#fff4cd"/><path d="M0-7V7M-7 0H7m-12-5L5 5M-5 5 5-5" stroke="${c}"/>`,
      berry:`<path d="M-10-4Q-12 4 0 13 12 4 10-4 0-11-10-4" fill="${c}"/><path d="m-7-7 7 4 7-4-4 0 0-5-4 4-4-4 1 5Z" fill="#769765"/><path d="M-5 0v2M2-1v2M-1 5v2M5 3v2" stroke="#fff0ca"/>`,
      grape:`<path d="m0-13 2-5m-2 6q7-8 12-3-5 7-12 3" fill="#75985e"/>${[[-6,-7],[4,-7],[-10,1],[0,1],[10,1],[-5,9],[5,9],[0,16]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="5" fill="${c}"/>`).join('')}`,
      apple:`<path d="M0-7Q-14-15-11 2-9 14 0 11 9 14 11 2 14-15 0-7" fill="${c}"/><path d="M0-7v-6m0 3q4-7 9-5-1 7-9 5" fill="#799461"/>`,
      cherry:`<path d="M-6 4 0-14 8 4M0-14q7-4 12 0" stroke="#7c9460" fill="none"/><circle cx="-7" cy="7" r="7" fill="${c}"/><circle cx="8" cy="7" r="7" fill="${c}"/>`,
      flower:`${[0,72,144,216,288].map(a=>`<ellipse cy="-7" rx="5" ry="8" transform="rotate(${a})" fill="${c}"/>`).join('')}<circle r="3" fill="#c6a15c"/>`,
      rose:`<path d="M0 9v9m0-5q-9-8-12-2 5 7 12 2" stroke="#789169" fill="#91a47d"/><circle r="11" fill="${c}"/><path d="M-7 0q2-10 11-4 7 7-2 11-9 1-7-6 3-5 7 0" fill="none" stroke="#fff" opacity=".6"/>`,
      leaf:`<path d="M-11 11Q-16-9 13-14 16 9-11 11" fill="${c}"/><path d="m-13 14 23-25m-15 16-2-9m5 5 8-1" stroke="#e5ead9"/>`,
      sprig:`<path d="M-4 17 4-17" stroke="#84966b"/>${[-10,-4,2,8].map(y=>`<ellipse cx="${y%4?2:-2}" cy="${y}" rx="5" ry="3" fill="${c}"/>`).join('')}`,
      shell:`<path d="M-4 10Q-22-9-9-13-1-23 5-13 20-13 4 10Z" fill="${c}"/><path d="M0 9-8-11M0 9 0-15M0 9 8-10" stroke="#f8f3e7"/>`,
      ring:`<ellipse rx="13" ry="10" fill="${c}"/><ellipse rx="8" ry="6" fill="#f5f0e4"/>`,
      pearl:`${[[-10,-4],[-6,4],[0,7],[6,4],[10,-4]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="4" fill="${c}" stroke="#c5b797"/>`).join('')}`,
      gem:`<path d="m-10-5 5-7H5L10-5 0 12Z" fill="${c}"/><path d="M-10-5H10M-5-12 0 12 5-12" stroke="#f6dfad"/>`,
      ribbon:`<path d="M0 0Q-22-19-18 1-17 12 0 0 22-19 18 1 17 12 0 0L-9 18-2 15 0 3 3 15 10 18Z" fill="${c}"/>`,
      cotton:`<path d="M0 10v8" stroke="#a59376"/>${[[-7,1],[7,1],[0,-6],[0,5]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="7" fill="${c}" stroke="#cec7b7"/>`).join('')}`,
      tea:`<path d="M-12-5H9V5Q-1 16-12 5Z" fill="#e9e0ca"/><ellipse cx="-2" cy="-5" rx="10" ry="3" fill="${c}"/><path d="M9-3q13-1 2 11M-15 13h29" fill="none" stroke="#b8a88b"/>`,
      terrarium:`<path d="m-7-13-7 23h28L7-13Z" fill="#d9e3d7" stroke="#8d9b7c"/><path d="M-12 6H12v4H-12Z" fill="${c}"/><path d="M0 5V-4m0 4q-9-7-7-9 8-1 7 9 7-9 10-5-1 6-10 5" fill="${c}"/>`,
      wood:`<rect x="-7" y="-15" width="14" height="30" rx="4" fill="${c}"/><path d="M-3-11v22M2-8v16" stroke="#dfc5a1"/>`,
      pouch:`<path d="m-8-9-4 22h24L8-9Z" fill="${c}"/><path d="M-9-7H9M-3-8l-5-8m11 8 5-8" stroke="#9e8492"/><circle cy="3" r="4" fill="#f4e9de"/>`,
      bamboo:`<path d="M-5-17v34M4-14v31" stroke="${c}" stroke-width="5"/><path d="M-8-7h6m3 10h6M-5 2q-14-13-14-4 4 7 14 4M4-6q14-13 14-4-4 7-14 4" fill="${c}"/>`
    };
    return shapes[d.motif]||shapes.leaf;
  }
  function icon(d){return `<svg viewBox="-22 -22 44 44" aria-hidden="true">${motif(d)}</svg>`;}
  function scene(outfit,accessories){
    const counts={};
    const ornaments=accessories.map(d=>{const n=counts[d.place]||0;counts[d.place]=n+1;
      const positions={neck:[90+n%3*10-10,65+Math.floor(n/3)*9],ear:[n%2?109:71,24+Math.floor(n/2)*10],brooch:[70+n%3*11,83+Math.floor(n/3)*10],hair:[75+n%3*13,7+Math.floor(n/3)*10],bracelet:[53+n%2*72,112+Math.floor(n/2)*10],bag:[127+n%2*14,88+Math.floor(n/2)*19],prop:[22+n%2*134,136-Math.floor(n/2)*30]};
      const [x,y]=positions[d.place];return `<g transform="translate(${x} ${y}) scale(${d.place==='prop'?'.65':'.36'})"><title>${d.label}</title>${motif(d)}</g>`;
    }).join('');
    return `<svg class="styling-scene" viewBox="0 0 180 190" role="img" aria-label="선택한 옷과 향기 액세서리를 함께 보여주는 스타일링 일러스트"><ellipse cx="90" cy="173" rx="66" ry="6" fill="#c8c2b2" opacity=".22"/><ellipse cx="90" cy="22" rx="17" ry="20" fill="#e2c9af"/><path d="M73 21Q66-8 91 0 113-2 108 23L101 12 83 9Z" fill="#746458"/><path d="M84 38v12h12V38" fill="#e2c9af"/>${outfit.replace('<svg ','<svg x="40" y="45" width="100" height="120" ')}<path d="M81 59q9 14 18 0" fill="none" stroke="#bca47b" stroke-width=".7"/>${ornaments}</svg>`;
  }
  root.ScentStyling={descriptor,icon,scene};
})(globalThis);
