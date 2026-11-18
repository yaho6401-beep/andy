# 기존 책과향기 사이트에 연결하기 — 구현 예시

확인된 운영 주소:
- 홈페이지: `https://andy-plum.vercel.app/`
- 기존 마을/아카이브: `https://andy-plum.vercel.app/archive/`
- 제안하는 독서 세계: `https://andy-plum.vercel.app/beyond/` (아직 존재하지 않는 신규 경로)

> **주의:** 운영 사이트의 실제 소스 구조는 확인되지 않았습니다. 아래는 재사용용 예제이며 그대로 덮어쓰면 안 됩니다.

## 1. 홈페이지 두 개의 입장 버튼

기존 React JSX의 적절한 위치에 다음을 삽입합니다.

```jsx
<nav className="world-entry">
  <a href="/archive/">🌿 책과향기 마을 · 함께하는 세계</a>
  <a href="/beyond/">📖 문장 너머 · 혼자만의 독서 여행</a>
</nav>
```

## 2. 기존 마을이 React Three Fiber 기반이라면

기존 마을 월드 안에서 **아바타 좌표와 실제 도서관 위치**를 확인한 뒤 다음과 같이 연결합니다.

```jsx
import VillageLibraryPortal from './VillageLibraryPortal.jsx';
// 또는 전체 도서관을 쓰려면 ExistingVillageLibrary.jsx를 이용

function ExistingVillageScene({ playerPositionRef }) {
  return <>
    {/* 기존 건물, 대화, 캐릭터는 모두 유지 */}
    <VillageLibraryPortal
      position={[12, 1.5, -8]} // 가상의 예시! 실제 도서관 위치로 교체해야 함
      getPlayerPosition={() => playerPositionRef.current}
      onEnter={() => window.location.assign('/beyond/')}
    />
  </>;
}
```

예제 포털은 가까이 접근한 뒤 E키를 누르거나 원형 포털을 클릭하여 이동합니다. 모바일을 위해서는 기존 마을의 DOM UI에도 `문장 너머 입장` 버튼을 추가하세요.

## 3. 기존 마을이 순수 Three.js 또는 다른 엔진이라면

`VillageLibraryPortal.jsx`를 그대로 쓰지 말고 기존 엔진의 Mesh + Raycaster + 월드 거리 체크 방식으로 포털을 구현합니다. 이동 자체는 동일합니다.

```js
// 기존 게임 루프에서: 실제 플레이어 좌표와 포털 좌표를 넣어 계산.
const nearPortal = Math.hypot(player.x - portal.x, player.z - portal.z) < 3.7;
if (nearPortal && userPressedInteract) window.location.assign('/beyond/');
```

## 4. 신규 독서 세계 라우팅

- **Vite SPA**인 경우: 기존 라우터에 `/beyond/` 경로를 등록하고 `App.jsx`에서 `World`를 렌더링. 기존 Vite 홈페이지를 새 프로젝트 `index.html`로 교체하지 않습니다.
- **Next.js App Router**인 경우: `app/beyond/page.jsx`에서 클라이언트 컴포넌트를 렌더링(`'use client'`; WebGL은 필요시 `dynamic(..., {ssr:false})`). `import.meta.env`는 `process.env.NEXT_PUBLIC_...` 또는 사이트 내 고정 내부 링크로 대체해야 합니다.
- **Next.js Pages Router**인 경우: `pages/beyond.jsx`에서 클라이언트 전용 컴포넌트를 가져옵니다. 이 경우에도 빌드 도구별 환경 변수 처리와 CSS 경로를 수정합니다.
- 루트와 다르게 `/beyond/`로 독립 배포하면 Vite의 `base` 설정과 호스팅 경로를 맞춰야 합니다.

## 5. 재입장과 실시간 연결

1. 마을에서 `/beyond/`로 이동할 때 마을 Scene과 네트워크 구독/실시간 소켓의 정리 함수가 실행되어야 합니다.
2. `/beyond/`에서는 실시간 아바타 동기화 및 채팅이 없습니다.
3. 다시 `/archive/`로 돌아오면 기존 인증 정책을 그대로 적용하고 필요한 소켓을 새로 연결합니다.
4. 개인 공간에서는 멀티플레이 성인 인증을 자동으로 우회하는 권한을 주지 않습니다. 기존 마을 입장 시 필요한 확인 절차는 유지해야 합니다.

## 6. 기존 그래픽 업그레이드 작업표

현재 운영 마을의 소스 코드를 확인하기 전에는 품질 향상을 완료했다고 말할 수 없습니다. 다음 작업을 실제로 수행하고 전후 캡처를 비교해야 합니다.

| 영역 | 기본 프로토타입 | 출시 수준 목표 |
|---|---|---|
| 캐릭터 | 기본 도형 캡슐·구체 | 통일된 2.5~3등신 GLB, 적절한 머리/옷, 걷기·앉기·비행 애니메이션 |
| 나무 | 임시 icosahedron | 가지·잎의 실루엣이 아름다운 3~5종 최적화 GLB, 인스턴싱 |
| 건물 | 박스 기반 오두막 | 지붕, 입구, 창틀, 책장, 소품을 포함한 소프트 로우폴리 모델 |
| 지면 | 절차적 고저차 | 산책로, 자연스러운 숲과 해변 색·질감, 일관된 머티리얼 |
| 빛 | 한 개의 햇빛 | 시간대별 조화로운 컬러와 라이트·정적 그림자 우선 |
| 바다 | 저비용 파동 셰이더 | 해안 물결, 얇은 거품, 바다 안개를 적은 셰이더 비용으로 표현 |
| 움직임 | 기초 이동 | 자연스러운 이동 블렌딩과 비행 카메라, 지형/건물 충돌 처리 |
| 배치 | 산발적 오브젝트 | 멀리서도 장소가 읽히는 랜드마크 중심 동선 |

### 그래픽 아트 디렉션

- 키워드: `cozy stylized 3D`, `soft low-poly`, `modern indie game`, `storybook atmosphere`, `warm natural lighting`.
- 메인 팔레트: 잔잔한 세이지 그린·크림·목재·바다 청록, 일부 햇살 노랑.
- 적은 폴리곤으로 부드러운 실루엣을 만들고, 한 공간 안에서 캐릭터와 배경의 디테일 밀도를 맞춥니다.
- 실사 텍스처/거친 픽셀 아트/원색 네온/블룸 남용은 피합니다.
- 기준: 현대 웹 3D의 보기 좋은 경량 디자인. **옛날 게임처럼 보이는 기본 도형만으로 완료 처리 금지.**

### 측정할 성능 지표

- 중급 안드로이드, iPhone Safari에서 장면 입장·비행·독서 전환 테스트
- 목표: 기본 화질에서 안정적인 30fps 이상(실측 조건 기록)
- 초기 로딩 리소스 크기 및 화면 표시 시간 기록
- 월드 5회 왕복 시 WebGL 컨텍스트 누수·메모리 증가 확인
- 그림자·후처리는 모바일 저화질에서 비활성화

## 7. 배포 체크리스트

- 홈에서 두 세계 바로 입장 가능
- 마을 도서관 → 문장 너머 포털
- 문장 너머 숲속 도서관 → 마을 포털
- 마을의 기존 채팅/아바타/승인 정책 보존
- 브라우저 뒤로 가기, 새로고침, 모바일 화면 회전 점검
- 한 줄 독서와 일지 JSON 백업 정상 동작
- PC/모바일 FPS와 전후 그래픽 캡처 확보
- 최종 사용자 승인 전 운영 배포 금지

## 8. 작은 도서관 전체 모델 추가 예제

`ExistingVillageLibrary.jsx`는 건물·창문·지붕·포털을 함께 추가하는 R3F 컴포넌트입니다.
기존 마을 월드의 실제 지면/동선/아바타 위치 확인 후 호출하세요.

```jsx
import ExistingVillageLibrary from './ExistingVillageLibrary.jsx';

<ExistingVillageLibrary
  position={[12, 0, -8]} // 반드시 기존 마을 좌표에 맞게 교체
  getPlayerPosition={() => playerPositionRef.current}
  onEnter={() => window.location.assign('/beyond/')}
/>
```

기본 모델은 시제품입니다. 세련된 출시 수준을 위해 GLB로 모델을 교체해야 합니다.
