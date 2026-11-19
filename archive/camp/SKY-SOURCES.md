# 대전 캠핑장 관측 하늘

위치: 대전 북위 36.35°, 동경 127.38°. 기기 GPS나 위치 권한은 사용하지 않는다.
날짜와 시간을 명시하고, 화면 드래그 방향을 북·동·남·서와 연결한다.
현재 태양 고도가 -6°보다 낮으면 현재 시각, 낮이면 같은 한국 날짜의 21시를 기본으로 한다.
사용자는 현재 시각·오늘 21시·오늘 05시로 바꿀 수 있다. 낮 하늘에서는 별이 사라진다.

## 계산과 출처

- 항성: IAU-CSN / SIMBAD의 J2000 적경·적위를 소수 세 자리로 반올림한 작은 수동 목록. 사진·표지·유료 콘텐츠를 복제하지 않는다.
  - https://iauarchive.eso.org/public/themes/naming_stars/
  - https://simbad.cds.unistra.fr/simbad/sim-basic?Ident=Polaris
- J2000 세차 보정: IAU 1976의 짧은 세차식. 고유운동·연주시차·광행차는 생략한다.
- 항성시와 적경/적위→고도/방위각: US Naval Observatory의 근사 항성시 및 수평좌표 변환식. UTC를 UT1 대신 사용한다.
  - https://aa.usno.navy.mil/faq/GAST
  - https://aa.usno.navy.mil/faq/alt_az
- 금성: NASA/JPL Table 1의 지구/금성 궤도요소와 세기당 변화율, 케플러 방정식 수치해. 태양중심 벡터의 차이를 지구중심 적경/적위로 바꾼다. 유효 기간 1800–2050년.
  - https://ssd.jpl.nasa.gov/planets/approx_pos.html
- 달: Paul Schlyter의 경량 궤도요소와 주요 경도·위도 섭동, 고도 시차 근사. 달 표면은 기존 NASA LRO 공개 자산을 재사용한다.
  - https://www.stjarnhimlen.se/comp/ppcomp.html

## 표현의 한계

관측 방향을 이해하기 위한 **위치 근사 재현**이며 전문 관측·항해용 천체력은 아니다.
대기굴절, 실제 지형의 수평선, 광공해·구름, 실제 달의 위상과 표면 방향은 재현하지 않는다.
금성은 고도 2° 초과, 태양 고도 -4° 미만일 때만 표시한다. 이는 단순 가시성 규칙이며 실제 관측을 보장하지 않는다.
북두칠성은 별자리 전체가 아닌 큰곰자리의 일곱 별로 안내한다. 별자리 연결선은 식별을 돕는 단순 안내선이다.

## 성능과 조작

작은 고정 항성 버퍼 1개 (약 5천 개의 6등급보다 밝은 실제 별), 재사용 연결선, 저해상도 돔과 기존 달 지도. 좌표는 진입·시각 변경 또는 15초마다 계산한다.
별을 화면 가운데에 0.7초 두면 관련 별이 은은하게 밝아지고 작은 자막이 나온다.
하늘 모드는 사용자 화면에서만 작동하며 서버 메시지나 다른 사람의 카메라를 바꾸지 않는다.
손 뒤집기는 기존 warm-hands 액션에 서버 검증되는 flip 옵션을 추가한다. 1.2초 간격, 모닥불 좌석, 과열 상태를 확인한다.
기존 불길·간식·채팅·멀티플레이 상태와 개인정보 정책은 유지한다.

## 배경 별 목록과 음향 라이선스

- 배경 항성: Hoffleit & Warren, Bright Star Catalogue, 5th Revised Ed., V/50, CDS/VizieR. 공개 천문 좌표·등급 사실 데이터만 추출하고 원문 문장·사진은 포함하지 않는다. 2026-11-19 조회, Vmag < 6.0. 안내용 별과 중복 좌표는 제외했다.
  - https://cdsarc.cds.unistra.fr/viz-bin/cat/V/50
  - https://heasarc.gsfc.nasa.gov/W3Browse/all/bsc5p.html
  - This work has made use of the VizieR catalogue access tool, CDS, Strasbourg, France. DOI: 10.26093/cds/vizier.
- 음료: “Drink Sip and Swallow”, OwlStorm / Ashe Kirk (Owlish Media), Freesound #320139, CC0 1.0. 원작자가 상업적 재사용·배포를 허용했다. 실제 컵에서 커피를 한 모금 마시고 삼키는 녹음. 볼륨만 작게 재생한다.
  - https://freesound.org/people/OwlStorm/sounds/320139/
  - https://creativecommons.org/publicdomain/zero/1.0/
  - 파일: /assets/camp/cup-sip-cc0.mp3 (62,099 bytes). 사용자가 소리를 켜고 마실 때 지연 로딩한다. 음소거·화면 숨김 시 기존 규칙을 유지한다.

검산: NASA JPL Horizons 지표 관측값, 2026-11-20 12:00 UTC 대전(127.38,36.35,0km)의 금성 방위각 329.605447°, 고도 -59.884038°. 구현: 329.617194°, -59.880333° (각각 차이 0.012° 미만).
