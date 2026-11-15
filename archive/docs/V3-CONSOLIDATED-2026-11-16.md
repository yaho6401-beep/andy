# 책과향기 메타버스 3.0 통합 검토본

기준: 운영 main `e6b25a2` + 오류 수정 검토본 `6ece604`.
재사용 원본: 로컬 `feature/v3-package-integration`의 `9dd4601` 구현과 `archive/vendor/bookscents-3` 전달 코드.

## 이번에 이어서 마무리한 부분

- 분리돼 있던 3.0 독서 세계를 최신 홈페이지/라운지 오류 수정본에 통합.
- 홈과 커뮤니티 양쪽에서 `/archive/`와 `/beyond/` 직접 입장. 기존 흑백 디자인, 예약 동선, 다섯 하단 탭, VIP/솔로만/캠핑장 링크와 관리자 전용 표시 조건 유지.
- 북라운지 도서관의 실제 포털과 개인 세계의 귀환 포털 연결. 이동 시 기존 실시간 접속을 종료하며 마을 귀환 시 원래 입장 절차 유지.
- 기존 마을에도 자체 GLB 아바타, 나무, 벤치, 책장, 향수병, 도서관 적용. 이전 경량 장식과 GPU 정리·모바일 조이스틱 오류 수정은 보존.
- 마을 카메라 드래그 회전, 카메라 거리 조절, 원래 시점 복원. 움직임은 현재 카메라 방향에 맞춤.
- 숲/바다 전망/하늘 언덕과 글라이더, 어디서나 독서, 한 줄 기록과 비공개 브라우저 일지. 원래 제공된 지형/바다/기록 형식을 재사용.
- 실제 벤치 독서는 앉는 위치에 맞춰 표현하고 종료하면 가구 밖의 안전한 위치로 복귀.
- GLB 로딩 시간 제한 및 기본 아바타 fallback, 공유 모델/개별 아바타 자원 소유권 분리, 저장소가 손상되거나 차단된 경우 처리.
- 기존 `/archive/v3/?world=...` 주소는 정식 두 경로로 이동. 독립 CSS와 빌드/정적 패키지 경로 포함.

## 모델과 성능

원본 자체 제작 GLB 두 개를 그대로 재사용: avatar 232,864 bytes, environment 1,366,572 bytes. 합계 1,599,436 bytes. 별도 텍스처/디코더/새 라이브러리 없음. 생성 소스 `archive/scripts/create-art.mjs`와 라이선스 `assets/metaverse3/LICENSE.md` 포함.

개인 숲 low 설정: 개발 PC Edge 390x844에서 약 50 FPS, 41 draw calls, 125,676 triangles. 실제 안드로이드/iPhone 하드웨어 측정은 하지 못했으므로 모바일 성능을 보장하는 수치가 아님.

전체 방 3회 재생성 후 카페의 geometry 93, texture 13으로 일정. 개인 세계 low/medium 5회 재생성 후 geometry 35,35,35,35,35로 일정. 기존보다 모델 실루엣을 보강했으나 전문 스켈레톤 리깅/최종 미술 승인까지 완료했다는 의미는 아님.

## 실제 실행한 검사

- `npm test`: 33/33. 기존 카페/귓속말/권한/충돌/로컬 20명 WebSocket 검사와 독서 기록/시각/저장 실패/JSON 검사.
- `node tests/beyond-flows.mjs`: 조이스틱, 비행 상승/하강/해안/착륙, 독서 시작시각 복원, 선택 입력/기록 없이 종료, 백업/복원/중복 병합, 잘못된 JSON 보존, 화질 재생성 통과. 개인 세계 Realtime/WS 요청 0건.
- `node tests/beyond-village-portal.mjs`: 실제 아바타로 정원 → 로비 → 북라운지 → 포털 → 문장 너머 → 포털 → 마을 입장 폼까지 통과.
- `node tests/beyond-lifecycle.mjs`: 마을/개인 세계 5회 왕복, 서버 관찰자로 이전 사용자의 퇴장 5회 확인.
- `node scripts/verify-client.mjs`: GLB 적용 후 아바타 24회 교체, 모바일 실제 방 왕복, 카페 주문 30초/수령/놓기, 입력 focus 정지, 저장소 차단 상태 입장 통과. 페이지 오류 없음.
- `node tests/v3-consolidated.mjs`: 최신 홈/커뮤니티 두 입구, 기존 VIP/캠핑장, 관리자 표시 숨김, 벤치 착석과 안전한 복귀, 카메라 설정 통과.
- `node scripts/capture-worlds.mjs`: 네 개 미리보기 실제 3D 화면 갱신, 3회 방 재생성 후 자원 안정 확인.
- `npm run build` / `node scripts/package-public.mjs`: 통과.

증거: `archive/.local/beyond`, `archive/.local/refine`, `archive/.local/v3-review` (개발용, Git/공개 패키지 제외).

## 보존 범위와 남은 검수

운영 main/도메인에는 반영하지 않음. 운영 DB, Edge Function, 관리자 권한 정책, 고객 신청서/메모/향 기록은 변경하지 않음. Blue Horizon의 파일/데이터/경로는 사용하지 않음. 기존 로컬 3.0 원본 브랜치도 유지.

실물 휴대폰의 Safari/Chrome, 발열/배터리, 공개 서버 20명 부하, 모델 미술 최종 검수는 별도 필요. 개인 독서 기록은 계정 동기화가 아닌 기기 저장이며 삭제/기기 변경 전에 JSON 백업 필요. 운영 배포 전 사용자 승인 필요.
