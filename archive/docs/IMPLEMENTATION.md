# BOOKS & SCENTS ARCHIVE — 조사 및 구현 계획

운영 기준: 2026-11-03, Asia/Seoul. 테스트 브랜치 feature/books-scents-archive. 실제 배포 및 운영 DB 변경은 승인 전 금지.

## 조사 결과
기존은 빌드 없는 정적 HTML/CSS/JavaScript + Supabase Edge Function feedback-wall. 기존 신청서는 workshop_lounge_applications에 있으며 연락처와 접수증을 보관하고, 회원 사용자 ID나 성인 확인 기록이 없다. 관리자 세션은 workshop_feedback_sessions로 서버 검증한다. 기존 테이블/레코드/상태를 변경하지 않고 archive 전용 데이터와 신청서 ID 연결을 추가한다.

## 구현 선택
기존 사이트와 같은 ES Modules + Three.js (버전 고정), 홈페이지에서 3D 라이브러리를 로드하지 않고 /archive/ 진입 때만 로드한다. React 전체 전환은 불필요하다. 독립된 모바일 전용 화면, 쿼터뷰, 코드로 제작한 오리지널 SD 캐릭터와 인테리어를 사용한다. 처음 네 공간(로비·향기 아카이브·북라운지·소셜 살롱), 기억의 전시실은 후속.

멀티플레이는 검증 가능한 공통 프로토콜과 로컬 권한 서버로 먼저 검증한다. 운영 어댑터는 Supabase Auth + 승인된 모임 멤버십 + SQL 검증 이동/채팅 RPC + 진행자 묶음 Broadcast를 사용한다. 위치는 이동 시 2Hz, 정지 0Hz, 생존 확인은 별도. 전원 위치를 직접 broadcast하면 20×2×20=800msg/s가 되어 무료 한도100msg/s를 넘는다. 묶음 snapshot2Hz는 20명 기준42msg/s(보낸1+받는20)를 목표로 한다. DB 부하와 실제 요금 계수는 스테이징에서 검증해야 하며 무료 운영을 보장하지 않는다. 월200만Realtime메시지, 동시200연결, 초당100메시지, 기존 사이트 사용량과 공유.

공유된 초대 링크 자체는 자격증명이 아니다. 이메일 OTP로 인증하고, 관리자가 기존 신청서·연락처·성인 여부를 확인한 후 auth.uid와 모임별 멤버십을 연결한다. 기존 10대 신청자는 자동 승인 금지. 클라이언트 성인 체크만으로 승인하지 않는다. 승인된 성인+입장 시간+정원+단일 세션 lease를 서버 검증한다.

## 주요 위험
- Vercel Hobby는 비상업용. 현재 팀 API에서 요금제 확인 불가. Pro 확인 또는 Cloudflare Pages 등 상업적 사용 가능 호스팅 검토 후 배포. 결제/유료생성 금지.
- 운영과 분리된 Supabase 테스트 프로젝트가 현재 없음: 운영 DB에 테스트 사용자/DDL을 넣지 않는다. 로컬 테스트와 SQL 계약 검증까지 준비하고 승인 시 스테이징 적용.
- 실제 휴대폰GPU/통신환경 20명 실측은 별도. 데스크톱 소프트웨어 렌더링 FPS를 모바일 성능으로 주장하지 않는다.
- 제공된 메시지에 인스타 참고 이미지는 첨부되지 않아 지정한 색감·SD비율을 따르는 독창적 디자인으로 진행.
- 채팅 신고·퇴장·상호동의는 서버 검증. 개인정보는 3D공간·위치패킷에 포함하지 않는다.

## 변경 파일
새 archive/index.html, archive/styles.css, archive/src/{main,world,avatar,transport,content,protocol}.js, archive/server/{dev-server,room-store}.mjs, archive/sql/setup.sql, archive/docs/{IMPLEMENTATION,TEST-REPORT,OPERATIONS}.md, archive/package.json 및 lockfile, archive/tests/*.test.mjs. 기존 index.html의 커뮤니티 라운지 입구 및 admin.html의 관리 링크만 추가.

## 단계별 완료 기준
1 조사: 코드·정책·한도 확인, 본 문서 작성.
2 공간: 네 공간과 전시·서가·소파·분수·사인, 세로화면 시각 검토.
3 이동: 조이스틱/키보드, 벽·가구충돌, 카메라, 대기·걷기·앉기·감정.
4 두 명: 별도 연결에서 실제 이동/말풍선/채팅 동기화.
5 부하: 10/20명 시뮬레이션, 21번째·중복·재접속, 메시지/지연 기록.
6 콘텐츠: 향카드·자체작성 문장·책장르·프로필 취향·밸런스 게임.
7 입장: 모임별 성인승인/정원/시간 검증과 상태전이.
8 진행: 질문/타이머/그룹/호감선택, 상호동의만 운영자에 노출.
9 관리: 콘텐츠·모임·참가상태·신고·퇴장 관리, 권한부정 테스트.
10 승인: 검토 가능한 로컬 결과물·테스트 보고서·운영 SQL 준비 후 운영 DB/배포 승인 요청. 실제 Supabase 네트워크 부하·RLS 검증은 분리된 스테이징 적용 후 통과해야 운영 가능.

## 출처
https://supabase.com/docs/guides/realtime/limits
https://supabase.com/docs/guides/realtime/pricing
https://supabase.com/docs/guides/platform/manage-your-usage/realtime-messages
https://supabase.com/docs/guides/realtime/authorization
https://vercel.com/docs/plans/hobby
https://developers.cloudflare.com/pages/platform/limits/
