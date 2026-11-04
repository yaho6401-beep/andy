# 책과향기 메타버스 2.0 — 조사 및 단계별 변경 계획

조사 기준: 2026-11-04 (Asia/Seoul), main 9c65fb821ccb602d7f36304ac4468d7d44fa34bf.
작업 브랜치: feat/starlight-camp-prototype. 운영 도메인 andy-plum.vercel.app은 변경하지 않는다.

## 현황

- 정적 HTML/CSS/ES modules 홈페이지. 루트 package.json 없음.
- Vercel: andy / prj_y44lIn4We0vkj0lflXt1JdS1hyI2. archive에서 npm ci/build 후 package-public으로 홈페이지와 /archive를 함께 배포.
- archive: Three.js 0.187.0, esbuild 0.28.2, Supabase JS 2.118.0, ws 8.22.1. 기존 5개 공간 garden/lobby/scents/books/salon. 현재 공간만 만들고 정적 가구를 재질별 병합함.
- avatar.js: 8개 캐릭터, 외모·머리·의상, 걷기/앉기/인사/박수/하트. localStorage archive-look 보존.
- main.js: WASD/방향키/조이스틱, 충돌/이동 경로 검증, 말풍선, 공간 이동, 설정/품질, 관리자 데스크.
- shared-transport.js → Supabase archive-live Edge Function. 500ms polling, 비가시 상태 3초, 만료/재연결/퇴장 처리. Supabase Realtime broadcast 방식은 아님.
- archive-live: 별도 게스트 세션(2시간), 관리자 feedback-wall 인증 확인, 최대 20명, DB 트랜잭션/방 잠금, 서버 검증. room-store에서 채팅 1.2초 제한, 신고 제한, 진행자 퇴장/차단 및 콘텐츠 편집.
- 현재 게스트 실시간 세션과 영구 개인 책장은 다른 수명. 영구 사용자 식별/복원 방법을 결정하기 전 임의로 기존 계정과 통합하지 않는다. 개별 사용자 음소거·차단과 욕설 필터는 보완할 항목이다.

## DB 읽기 전용 조사

연결 대상 jqlrwwheiwjdrobluifx. public 27개 테이블 및 archive_private.rooms/sessions/join_limits 확인. 모두 RLS 활성. public은 주로 service_role 정책으로 Edge Function을 통해 접근하며, archive_private에 anon/authenticated 테이블 권한은 조회되지 않았다. 실제 사용자 행·연락처·암호·토큰은 조회하지 않았다.

기존 도메인: workshop_feedback 및 comments/hearts/edit_keys/settings/admin/sessions/limits, workshop_gallery 및 contacts/likes/awards, workshop_scent_accounts/sessions/records/staff/reviews/likes, workshop_staff_accounts/sessions/comments/comment_likes, workshop_lounge_applications, workshop_game_sessions/players/draws, workshop_site_events.

archive_private.rooms: id/text, state/jsonb, updated_at/timestamptz. sessions: token_hash/player_id/nickname/role/admin_hash/expires_at/created_at. join_limits: key/count/expires_at.

신규 데이터 후보 8종은 현재 실제 테이블과 이름 중복 없음. 단 기존 scent_records에 문장/감상 필드가 있으므로 해당 조향 기록은 유지하고 메타버스 책장과 역할을 분리한다. RLS 활성 확인은 전체 보안 검증을 의미하지 않는다. 권한 함수·스토리지·서버 입력 검증의 전체 감사는 후속 단계.

## 보존 범위

루트 홈페이지, 추천/직접조향/조향 데이터, 갤러리, 메모, 예약 링크, 관리자/직원, 솔로만 신청, 기존 5개 공간, 채팅/좌석/관리자 권한을 유지한다. 기존 저장 키·테이블·운영 함수 변경 없음. BLUE HORIZON 코드/데이터/링크 연결 없음.

## 개발 순서와 예상 파일

| 단계 | 구현 및 검증 | 예상 파일 |
| --- | --- | --- |
| 1/2 작은 첫 작업 | 독립된 /archive/camp/ 혼자 체험. 기존 아바타 재사용, 모닥불, 의자 6개, 텐트 2개, 숲/별/칠판/책장/랜턴, WASD/조이스틱, 근접 착석/일어나기, 리소스 정리. DB 쓰기/실시간 접속 없음. | archive/camp/{index.html,main.js,world.js,layout.js,styles.css}, archive/scripts/build.mjs, archive/index.html, archive/tests/camp-layout.test.mjs |
| 3 소셜 연결 | 로컬 테스트 서버부터 camp 방/좌석 서버 검증, 기존 세션·외모·채팅 재사용, 말풍선/감정/듣기모드, 신고/개별차단/음소거, 도배/욕설 방지. 좌석 선점 경쟁 및 재접속 검증. | archive/src/{protocol,seats,content,main,shared-transport}.js, server/room-store.mjs, supabase/functions/archive-live/*, tests |
| 4 책 콘텐츠 | Asia/Seoul 날짜, 예약 문장/출처/저자/허락 정보, 감상/향기 태그/책장 공개범위, 기존 관리자 인증. 소유권 검증 후 별도 migration. | 신규 archive/src/reading-*.js, 관리자 UI, 신규 Edge Function 모듈, supabase/migrations/*, tests |
| 5 재방문 | 서버 기준 일일 활동 한도/중복 방지, 나무 5단계, 상태 영구 보존, 응원 게시판 검증/신고/숨김. | 신규 tree/mailbox UI·서버 모듈, migrations, tests |
| 6 검수 | 실제 모바일 로딩/FPS, 다중 사용자/좌석 경쟁/세션 만료/권한, 회귀·보안·미리보기 검증. 승인 후 운영 배포. | 성능 및 검수 기록 |

3단계는 로컬/미리보기용 백엔드에서 먼저 검증한다. 현재 운영 Edge Function의 방 목록은 camp를 모르므로 화면만 연결하지 않는다. 미리보기 화면의 테스트 버튼이 운영 채팅/DB를 수정하지 않게 분리한다. 다중 모닥불은 room/instance ID와 서버 좌석 고유 키를 설계한 후 확장한다.

## 이번 첫 작업의 한계

독립된 공간 시제품이며 여러 사람이 모이는 완성본이 아니다. 칠판은 책과향기 이름으로 작성한 시연용 창작 문장, 관리자 등록/일일 콘텐츠/책장/나무/우체통은 후속 작업이다. 성인 동의/기존 인증을 우회해 운영 채팅에 입장시키지 않는다. 실제 휴대폰 30FPS 및 로딩 속도는 물리 기기로 별도 검증해야 한다.

## 실행 결과

- 신규 코드: `archive/camp/{index.html,main.js,world.js,layout.js,styles.css}`.
- 기존 변경: `archive/index.html`에 시제품 링크 1개 추가, `archive/scripts/build.mjs`에 캠핑장 별도 번들 추가. 테스트 2개 파일 및 이 문서 추가. 홈페이지 루트 및 운영 서버/DB 파일 변경 없음.
- `npm ci`, `npm run build`, `node scripts/package-public.mjs` 성공. 홈페이지 정적 파일 61개를 패키징 결과와 바이트 비교(정확한 개수는 실행 로그 참고).
- 루트 `node --test tests/*.test.mjs`: 19/19 통과. 기존 추천/조향/갤러리/기록장/솔로만/관리자·직원/게임·다국어 소스·서버 검증 포함. 브라우저 전체 회귀를 대체하지 않음.
- archive 순수 자동 검사: 기존 19개 + 신규 좌석/충돌/모델 구성 3개 = 22/22 통과. 신규 캠핑장 모델은 정적 병합 후 36개 mesh, 5,148 triangles(아바타 제외), canvas texture 1장 512×256.
- archive 전체 npm test의 기존 20인 network.test는 `127.0.0.1:4173 ECONNREFUSED`. 미리보기 daemon은 실행되지만 테스트 실행기에서 로컬 테스트 API에 연결되지 않아 동시접속 검증 미완료. 운영 서버로 대체 시험하지 않음.
- 브라우저에서 홈페이지 → 기존 커뮤니티 → 캠핑장 링크 이동 확인. 원격 Chrome에서 기존 커뮤니티와 신규 캠핑장 모두 `GL_RENDERER = Disabled`, `Error creating WebGL context` 발생. 새 화면의 미지원 안내 확인. 3D 외형/이동/착석/문장 팝업의 실제 브라우저 완료 검증, 모바일 조이스틱 및 물리 휴대폰 FPS/로딩은 미완료.
- WebGL 미지원 초기화 실패에도 안내/문장 UI 이벤트를 등록하도록 정리 코드를 보완함. 키보드는 버튼 클릭 후에도 이동 키를 받을 수 있도록 입력 필드만 제외. bfcache 복귀 시 새로고침 처리.
- DB는 스키마/정책/마이그레이션 메타데이터만 SELECT. 마이그레이션 적용, 기존 행 변경, Edge Function 배포 없음.
- 운영 배포/승격/병합 없음. 미리보기 결과는 별도 브랜치와 배포 URL로 전달한다.
