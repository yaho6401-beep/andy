(function(root){
  'use strict';
  const labels={rat:'쥐 · 자',ox:'소 · 축',tiger:'호랑이 · 인',bunny:'토끼 · 묘',dragon:'용 · 진',snake:'뱀 · 사',horse:'말 · 오',goat:'양 · 미',monkey:'원숭이 · 신',rooster:'닭 · 유',dog:'개 · 술',pig:'돼지 · 해',bear:'곰돌이',cat:'고양이',fox:'여우'};
  const round=(color)=>`<ellipse cx="32" cy="36" rx="23" ry="22" fill="${color}"/>`;
  const ears=(color,size=8)=>`<circle cx="16" cy="17" r="${size}" fill="${color}"/><circle cx="48" cy="17" r="${size}" fill="${color}"/>`;
  const faces={
    rat:ears('#bfc4c2',11)+'<circle cx="16" cy="17" r="6" fill="#e5bfc3"/><circle cx="48" cy="17" r="6" fill="#e5bfc3"/>'+round('#cdd1ce')+'<path d="m18 43-10-2m10 6-10 1m38-5 10-2m-10 6 10 1" stroke="#a3a6a1"/>',
    ox:'<path d="M15 21Q1 12 10 5l9 10M49 21q14-9 5-16l-9 10" fill="#e8d3a2"/>'+ears('#b69b7d',7)+round('#cdb496')+'<ellipse cx="32" cy="46" rx="15" ry="10" fill="#edddbe"/><circle cx="27" cy="47" r="2" fill="#a18872"/><circle cx="37" cy="47" r="2" fill="#a18872"/>',
    tiger:ears('#dba36b')+round('#e9b57b')+'<path d="M26 15h12l-6 10Zm-16 13 12 5-12 2m44-7-12 5 12 2M13 43l10-3m28 3-10-3" fill="#8e755e"/><ellipse cx="32" cy="44" rx="12" ry="9" fill="#f9e7ca"/>',
    bunny:'<ellipse cx="22" cy="17" rx="7" ry="16" transform="rotate(-10 22 17)" fill="#fff6e9"/><ellipse cx="43" cy="17" rx="7" ry="16" transform="rotate(10 43 17)" fill="#fff6e9"/><ellipse cx="22" cy="16" rx="3" ry="11" fill="#e9b8c1"/><ellipse cx="43" cy="16" rx="3" ry="11" fill="#e9b8c1"/><ellipse cx="32" cy="39" rx="23" ry="19" fill="#fff6e9"/>',
    dragon:'<path d="m17 23-5-13 9 3 2-10 7 17m17 3 5-13-9 3-2-10-7 17" fill="#e3c892"/><path d="m10 30-7 7 7 7m44-14 7 7-7 7" fill="#91b49c"/>'+round('#acd0ad')+'<ellipse cx="32" cy="45" rx="14" ry="10" fill="#d6e5b5"/><path d="m27 18 5-8 5 8" fill="#8daf86"/>',
    snake:'<path d="M18 51Q4 66 34 63 63 60 48 49" fill="#93b68a"/>'+round('#b4cea1')+'<path d="m26 16 6 9 6-9" fill="#d8dfac"/><path d="m32 48v9m0-2-4 4m4-4 4 4" stroke="#cb8c8c" fill="none" stroke-width="2"/>',
    horse:'<path d="m18 24-4-20 12 9 4 15m16-4 4-20-12 9-4 15" fill="#c4a186"/><path d="M20 20q12-19 24 1l-7 6-7-8-5 9Z" fill="#8e7562"/><ellipse cx="32" cy="38" rx="20" ry="25" fill="#ceb094"/><ellipse cx="32" cy="49" rx="14" ry="10" fill="#ecdbc1"/>',
    goat:'<path d="M18 27Q0 10 17 9l8 11m21 7Q64 10 47 9l-8 11" stroke="#b79f7f" stroke-width="6" fill="none"/>'+round('#eee4cd')+[[-15,0],[-9,-9],[0,-12],[9,-9],[15,0]].map(([x,y])=>`<circle cx="${32+x}" cy="${24+y}" r="7" fill="#fff4df"/>`).join('')+'<path d="m25 54 7 9 7-9" fill="#fff4df"/>',
    monkey:ears('#b6957b',11)+'<circle cx="16" cy="17" r="6" fill="#e2c4a6"/><circle cx="48" cy="17" r="6" fill="#e2c4a6"/>'+round('#ba9a7f')+'<path d="M32 24Q13 12 14 36 15 57 32 57 49 57 50 36 51 12 32 24" fill="#edcfad"/>',
    rooster:'<path d="M24 23Q11-4 26 2 31-9 36 3 52-1 42 23" fill="#d99595"/>'+round('#fff0cf')+'<path d="m27 42 5-6 6 6-6 6Z" fill="#d8a25d"/><path d="M29 50q3 16 7 0" fill="#d99595"/>',
    dog:'<path d="M20 17Q0 9 5 40q4 10 15-5m24-18q20-8 15 23-4 10-15-5" fill="#ad8d73"/>'+round('#dfc4a0')+'<ellipse cx="22" cy="32" rx="7" ry="9" fill="#c2a080"/><ellipse cx="32" cy="45" rx="12" ry="9" fill="#f5e5c8"/>',
    pig:'<path d="m13 30-4-23 20 13m22 10 4-23-20 13" fill="#e7b2b5"/>'+round('#f0c2c2')+'<ellipse cx="32" cy="45" rx="13" ry="9" fill="#dda2ad"/><circle cx="27" cy="45" r="2" fill="#b77e89"/><circle cx="37" cy="45" r="2" fill="#b77e89"/>',
    bear:ears('#ba9171',9)+'<circle cx="16" cy="17" r="4" fill="#e2bfa5"/><circle cx="48" cy="17" r="4" fill="#e2bfa5"/>'+round('#cba483')+'<ellipse cx="32" cy="43" rx="11" ry="8" fill="#f0dcc4"/>',
    cat:'<path d="m11 30 1-22 18 13h5L53 8l1 23q12 28-22 28Q-1 58 11 30" fill="#d6c4af"/><path d="m17 24 0-9 9 9m13 0 9-9v10" fill="#e8b8ad"/><path d="m17 43-11-2m11 6-11 1m41-5 11-2m-11 6 11 1" stroke="#9d8772"/>',
    fox:'<path d="m9 30 1-24 21 15h2L54 6l1 24q2 18-23 30Q7 49 9 30" fill="#d79b70"/><path d="m14 32 18 13 18-13q-1 17-18 23-17-6-18-23" fill="#fff0d7"/><path d="m16 23-1-8 10 9m14 0 10-9-1 8" fill="#ecc7a2"/>'
  };
  function illustration(kind){return `<svg class="feedback-animal" viewBox="0 0 64 68" aria-hidden="true">${faces[kind]||faces.bear}<circle cx="24" cy="35" r="2" fill="#594d43"/><circle cx="41" cy="35" r="2" fill="#594d43"/>${['pig','rooster','snake'].includes(kind)?'':'<ellipse cx="32" cy="41" rx="3" ry="2" fill="#735648"/><path d="M32 43v3m0-1q-4 4-6 0m6 0q4 4 6 0" stroke="#735648" stroke-width="1.2" fill="none" stroke-linecap="round"/>'}<ellipse cx="17" cy="42" rx="4" ry="2" fill="#df9b9d" opacity=".6"/><ellipse cx="47" cy="42" rx="4" ry="2" fill="#df9b9d" opacity=".6"/></svg>`;}
  root.FeedbackAnimals={labels,illustration};
})(globalThis);
