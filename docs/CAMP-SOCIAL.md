# 별빛 캠핑장 — 소셜 기능 미리보기

작업 범위: 통합 지시서 3단계. 운영 배포 승인 전, 기존 홈페이지/라운지와 분리된 미리보기에서 검증한다.

## 구현

- 기존 ArchiveStore/좌석 검증/폴링 전송 구조를 재사용한다. 기존 클래스의 이동 검사와 좌석 정의를 주입 가능하게 확장했으며 기본 동작은 그대로다. 운영 archive-live 함수 및 그 배포용 shared 소스는 변경하지 않는다.
- 캠핑장 최대 20명, 모닥불 4개 인스턴스에 각 최대 6명. 빈 모닥불 자동 배치 및 수동 이동. 모델은 한 공간만 재사용한다.
- 서버가 이동 경로·속도·의자 접근 거리·중복 착석을 검증한다. 방/좌석 변경 시 epoch를 변경하여 지연된 이동 패킷을 무시한다.
- 공간 공개 대화, 착석자 대화, 아바타 말풍선, 인사/박수/하트. 가상 참가자나 가짜 접속자를 표시하지 않는다.
- 오늘의 대화 주제는 서버 Asia/Seoul 날짜로 변경. 기존 관리자 인증을 확인한 진행자가 당일 주제를 바꿀 수 있다.
- 조용히 듣기는 서버에서 채팅 전송을 거절한다. 음소거는 자기 화면의 대상 채팅만 숨김, 차단은 양방향 메시지/아바타를 숨김. 개인 설정은 다른 사용자 스냅샷에 포함하지 않는다.
- 신고 내용은 관리자만 조회. 기존 관리자 비밀번호 인증의 세션을 매 요청 검증한 뒤 진행자 권한을 적용한다. 일반 방문자는 진행자 질문 변경/퇴장/신고 목록에 접근 불가.
- 기본 욕설 정규화 필터, 반복 문자·30초 내 같은 문장 거절, 1.2초 전송 간격, API 요청 빈도·크기·batch 중복 처리를 검증한다. 기본 사전 필터는 모든 유해 표현을 탐지하는 완전한 모더레이션이 아니다.
- WebGL 사용 불가 시 2D 지도로 전환. 동일 이동/좌석/채팅 검증을 사용하며, 2D를 3D 검수나 모바일 FPS 측정으로 보고하지 않는다.

## 운영 데이터 분리

새 Edge Function `archive-camp-preview`만 배포한다. 같은 Supabase 프로젝트의 비공개 `archive_private.rooms`에 `camp-preview-v2` 행 하나를 추가한다. 기존 `community` 행과 기존 sessions/join_limits/사용자 정보/조향 데이터는 수정하지 않는다. preview 행 안의 방 상태·익명 세션·개인 차단 설정은 운영과 분리된다. 관리자 인증 테이블은 세션 유효성을 SELECT할 때만 사용한다.

마이그레이션: `supabase/migrations/20261104082830_initialize_isolated_camp_preview_state.sql`. 기존 행은 ON CONFLICT DO NOTHING으로 보존. 추가 전후 운영 community 상태 해시 일치 확인. 새로운 테이블/정책/권한 부여는 없다. rooms의 RLS 및 anon/authenticated 비허용을 유지한다.

새 함수는 publishable API key와 자체 발급 opaque 토큰을 확인한다. 원문 토큰은 저장하지 않고 SHA-256 해시만 저장, 세션 수명 2시간. 관리자 세션은 추가로 검증한다. verify_jwt=false는 Supabase Auth JWT와 다른 기존 방문자 세션 방식에 맞춘 설정이며 자체 인증을 생략하지 않는다. 기존 운영 함수 설정은 변경하지 않는다.

클라이언트 저장 키: camp-preview-guest-session / camp-preview-connection-id / camp-preview-nickname. 기존 archive-guest-session / archive-look은 변경하지 않는다. 외모는 archive-look을 읽어서 재사용한다.

프리뷰 도메인만 CORS 허용, 운영 andy-plum.vercel.app은 이 엔드포인트의 허용 목록에서 제외한다. 브라우저 종료 시 leave, 연결 두절 45초 뒤 다음 요청에서 퇴장. 메시지는 1시간 이내 최대 200개, 신고는 7일 최대 100개로 정리된다. 신고/세션 등 만료 정리는 새 요청 시 수행한다. 개인정보를 적지 않도록 안내한다.

## 검증 현황

- 루트 기존 자동 검사 19/19 통과.
- archive 순수 자동 검사 29/29 통과(기존 공간 및 캠핑장 충돌/모델/좌석/20인 분배/차단·듣기·권한/세션·batch).
- 빌드와 홈페이지 포함 패키징 성공.
- 실제 HTTP/DB 통합 검증 및 브라우저 검수 결과는 후속 기록에 추가한다.
- WebGL/물리 휴대폰 30FPS, 모바일 터치 조이스틱, 장시간 실사용 부하/트래픽 비용은 별도 검증이 필요하다.
- 2단계 문장 팝업은 시연용 창작 문장이다. 영구 책장/나무/응원 게시판/관리자 문장 예약은 다음 단계다.

## 변경 파일

- UI: archive/camp/index.html, main.js, styles.css, transport.js; archive/index.html 진입 링크.
- 서버: archive/camp/store.mjs, service.mjs; archive/server/room-store.mjs 및 social.mjs의 기본값 유지 확장.
- 미리보기 함수: supabase/functions/archive-camp-preview/index.ts와 shared 의존 파일.
- 배포 준비: archive/scripts/prepare-camp-edge.mjs.
- 검증: archive/tests/camp-social.test.mjs, camp-http.mjs 및 이 문서; preview 초기화 migration.
