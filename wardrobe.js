(function(root){
  'use strict';
  const labels={shirt:'실크 셔츠와 테일러드 팬츠','soft-shirt':'소프트 셔츠와 와이드 팬츠',dress:'플루이드 미디 드레스','tailored-dress':'테일러드 벨티드 드레스','evening-dress':'새틴 슬립 드레스',suit:'테일러드 수트',casual:'코튼 티와 스트레이트 데님',sport:'라이트 윈드브레이커',jumpsuit:'와이드 레그 점프수트',cardigan:'파인 니트 카디건',linen:'리넨 셔츠와 이지 팬츠'};
  function garment(style,kind){
    const [a,b,c]=style.colors.map(x=>x[1]);
    const seam='#6b695b';
    const pants=`<path d="M64 116Q90 110 116 116L122 222Q111 225 99 222L90 148 81 222Q69 225 57 222Z" fill="${b}"/><path d="m75 123-4 93m34-93 4 93M90 119v28" stroke="${seam}" opacity=".25"/><path d="M67 119h46" stroke="#fff" opacity=".35"/>`;
    const shoes=`<path d="m59 222-4 8q14 4 25-1v-7m20 0v7q14 5 26 0l-6-7" fill="${c}" opacity=".85"/>`;
    const gold='<circle cx="91" cy="91" r="1.5" fill="#b89b64"/><circle cx="91" cy="105" r="1.5" fill="#b89b64"/>';
    const shirt=`<path d="M65 26 78 21Q90 30 102 21L115 26Q120 31 123 42L139 101 126 107 112 62 116 123Q90 129 64 123L68 62 54 107 41 101 57 42Q60 31 65 26Z" fill="${a}"/><path d="m78 22 12 20-10 8-8-21m30-5L90 42l10 8 8-21M90 42v81M67 115q22 5 46 0" stroke="${seam}" opacity=".35"/><path d="m62 45 4 52m52-52-4 52" stroke="#fff" opacity=".5"/>${gold}`;
    const dress=`<path d="M72 23 81 20Q90 31 99 20L108 23 124 56 112 63 105 49 103 82Q109 108 116 135L137 210Q90 226 43 210L64 135Q71 108 77 82L75 49 68 63 56 56Z" fill="${a}"/><path d="M77 81q13 4 26 0" stroke="${c}" stroke-width="2.2"/><path d="M80 92q-1 66-17 118m24-116-4 121m13-119 14 115M104 98q10 67 21 107" stroke="${b}" opacity=".45"/><path d="M74 26q15 19 32 0" stroke="#fff" opacity=".6"/><path d="m80 84 18 2 8 20" stroke="${c}" opacity=".7"/>`;
    const suit=pants+`<path d="M65 26 78 19H102L115 26 132 100 120 105 110 62 116 137Q101 137 90 127 79 138 64 137L70 62 60 105 48 100Z" fill="${a}"/><path d="m78 20 12 16 12-16-12 69Z" fill="#f5f2e8"/><path d="m77 21-7 21 9 4-5 8 16 31 16-31-5-8 9-4-7-21M90 85v42M70 102h13m14 0h13" stroke="${seam}" opacity=".5"/><path d="m90 37-3 7 3 32 3-32Z" fill="${c}" opacity=".8"/>${gold}`;
    const tailored=`<path d="M68 26 78 20H102L112 26 127 82 115 86 105 53 105 87 118 211Q90 219 62 211L75 87 75 53 65 86 53 82Z" fill="${a}"/><path d="m78 22 12 23 12-23M90 45v41m-15 1h30m-25 9-4 113m24-113 4 113" stroke="${b}" opacity=".7"/><path d="M74 86h32" stroke="${c}" stroke-width="3"/><rect x="87" y="83" width="8" height="6" rx="1" fill="none" stroke="#b69a64"/>${gold}`;
    const evening=`<path d="M77 25 80 15 83 15 83 33Q90 45 98 33L98 15H101L104 25 101 75Q103 106 115 154L126 216Q100 224 91 220 75 225 53 216L65 154Q78 106 79 75Z" fill="${a}"/><path d="M82 36q8 16 17 0M97 77q-5 61 16 135M79 84q5 50-11 125" stroke="${b}" opacity=".65"/><path d="M96 97q-5 52 8 110" stroke="#fff" stroke-width="3" opacity=".25"/>`;
    const tee=pants+`<path d="M66 29 78 24Q90 36 102 24L114 29 135 62 118 71 108 56 112 123Q90 128 68 123L72 56 62 71 45 62Z" fill="${a}"/><path d="M78 26q12 17 24 0m-31 91q19 4 38 0M53 58l10 6m54 0 10-6" stroke="${seam}" opacity=".22"/>`+shoes;
    const sport=pants+`<path d="M67 30 78 18Q90 11 102 18L113 30 136 103 124 109 109 66 113 126H67L71 66 56 109 44 103Z" fill="${a}"/><path d="M78 19q12 27 24 0M90 42v82M69 89l14 8m14 0 14-8" stroke="${c}" opacity=".65"/><path d="M65 45h50" stroke="#fff" opacity=".5"/><path d="M68 124h44" stroke="${c}" stroke-width="3"/>`+shoes;
    const jumpsuit=`<path d="M71 26 80 21 90 41 100 21 109 26 122 66 111 72 104 54 103 94 121 222H99L90 135 81 222H59L77 94 76 54 69 72 58 66Z" fill="${a}"/><path d="M78 94h24M90 43v49m-9 11-9 112m27-112 9 112" stroke="${b}" opacity=".65"/><path d="M77 94h27" stroke="${c}" stroke-width="2"/>`;
    const knit=pants+`<path d="M67 29 79 22H101L113 29 133 108 119 112 108 65 113 137H67L72 65 61 112 47 108Z" fill="${a}"/><path d="M79 23h22v105H79Z" fill="${b}"/><path d="M79 23 90 61 101 23M90 61v74M69 115h14m14 0h14" stroke="${seam}" opacity=".35"/><path d="M70 131h40M52 102l9-2m58 0 9 2" stroke="${c}" opacity=".5"/>${gold}`;
    const paths={dress,'tailored-dress':tailored,'evening-dress':evening,suit,casual:tee,sport,jumpsuit,cardigan:knit,linen:pants+shirt,shirt:pants+shirt,'soft-shirt':pants+shirt};
    return `<svg class="outfit outfit-${kind}" data-garment="${kind}" viewBox="0 0 180 240" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width=".75" role="img" aria-label="${labels[kind]||labels.shirt}">${paths[kind]||pants+shirt}</svg>`;
  }
  root.ScentWardrobe={garment,labels};
})(globalThis);
