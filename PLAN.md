# 계획: 미니 RPG API + 탐정 수사 에이전트 팀 시나리오

## Context

에이전트 팀의 **모든 기능**(팀 생성, 작업 목록, 작업 종속성, 직접 메시지, 계획 승인, 위임 모드, broadcast, 자체 청구, 종료, 정리)을 자연스럽게 체험할 수 있는 실습 환경이 필요하다.

**접근 방식**: 의도적으로 버그와 보안 이슈가 숨겨진 미니 RPG 게임 API를 먼저 만들고, 에이전트 팀이 "탐정단"이 되어 이 코드의 문제를 수사하는 시나리오를 구성한다.

---

## Part 1: 미니 RPG 게임 API 구축

### 기술 스택
- Node.js + Express
- 인메모리 데이터 저장 (JSON 객체, DB 없이)
- JWT 인증
- 순수 JavaScript
- 단일 파일 웹 UI (HTML/CSS/JS)

### 프로젝트 구조

```
rpg-api/
├── package.json
├── server.js              # Express 서버 진입점
├── public/
│   └── index.html         # 게임 웹 UI (단일 파일, dark theme)
├── middleware/
│   └── auth.js            # JWT 인증 미들웨어 (버그 1)
├── routes/
│   ├── characters.js      # 캐릭터 CRUD (버그 2, 3)
│   ├── items.js           # 아이템/인벤토리 (버그 4)
│   ├── battles.js         # 전투 시스템 (버그 5, 6)
│   └── leaderboard.js     # 리더보드 (버그 7)
├── data/
│   └── store.js           # 인메모리 데이터 저장소
└── utils/
    └── helpers.js         # 유틸리티 함수 (버그 8)
```

### 웹 UI
- 단일 HTML 파일, 빌드 도구 없음
- 다크 테마 (게임 분위기)
- 탭 기반: Characters, Battle, Items, Leaderboard
- Login/Register 인증 화면
- DOM API 기반 렌더링 (XSS 방지)

### 숨긴 버그 목록 (8개)

#### 보안 취약점
1. **인증 우회** (`middleware/auth.js`) - Bearer 대소문자 구분 → jwt.decode 우회 (★★☆)
2. **ReDoS** (`routes/characters.js`) - `new RegExp(userInput)` 직접 사용 (★★★)
3. **민감 정보 노출** (`routes/characters.js`) - password_hash 필드 노출 (★☆☆)

#### 로직 버그
4. **인벤토리 복제** (`routes/items.js`) - 얕은 복사로 객체 참조 공유 (★★★)
5. **음수 데미지** (`routes/battles.js`) - Math.max(0, damage) 누락 → HP 증가 (★★☆)
6. **레벨업 오류** (`routes/battles.js`) - `>` 대신 `>=` 필요 (off-by-one) (★☆☆)

#### 성능 이슈
7. **O(n*m) 리더보드** (`routes/leaderboard.js`) - 캐싱 없는 중첩 루프 (★★☆)
8. **동기 I/O** (`utils/helpers.js`) - fs.appendFileSync 블로킹 (★☆☆)

### API 엔드포인트

| 메서드 | 경로 | 설명 |
|---|---|---|
| POST | /auth/register | 회원가입 |
| POST | /auth/login | 로그인 (JWT 발급) |
| GET | /characters | 캐릭터 목록 |
| POST | /characters | 캐릭터 생성 |
| GET | /characters/search?name= | 캐릭터 검색 |
| GET | /items | 아이템 목록 |
| POST | /items/pickup | 아이템 줍기 |
| POST | /items/trade | 아이템 거래 |
| POST | /battles/attack | 전투 (공격) |
| POST | /battles/heal | 캐릭터 힐 |
| GET | /battles/history | 전투 기록 |
| GET | /leaderboard | 리더보드 |
| GET | /health | 서버 상태 |

---

## Part 2: 탐정 수사 에이전트 팀 시나리오

### 시나리오 설정

> "RPG 게임 서버에서 이상 현상이 보고되었다. 유저들이 무한 HP를 얻고, 아이템이 복제되고, 인증을 우회하는 사례가 속출한다. 탐정 팀을 파견하여 모든 문제를 찾아내고 수사 보고서를 작성하라."

### 팀 구성 (5명)

| 역할 | 담당 | 사용할 에이전트 팀 기능 |
|---|---|---|
| **수사반장** (리더) | 조율 전용 | 위임 모드, 작업 할당 |
| **보안 전문가** | auth.js, 인젝션, 정보 노출 | 계획 승인, 직접 메시지 |
| **포렌식 분석가** | 로직 버그 (items, battles) | 계획 승인, 가설 공유 |
| **성능 프로파일러** | 성능 이슈 (leaderboard, helpers) | 자체 청구, 직접 메시지 |
| **QA 수사관** | 버그 재현 테스트 작성 | 작업 종속성 |

### 시나리오 흐름

```
Phase 1: 팀 생성 & 계획 수립
  → TeamCreate, 위임 모드, 작업 목록, 작업 종속성, 계획 승인

Phase 2: 병렬 수사
  → 계획 승인/거부, 병렬 작업, 직접 메시지, 자체 청구

Phase 3: 단서 공유 & 토론
  → broadcast, 팀원 간 토론, 작업 차단 해제

Phase 4: 증거 수집 & 보고서
  → QA 테스트 작성, 결과 종합

Phase 5: 정리
  → shutdown_request, TeamDelete
```

자세한 시나리오 프롬프트와 관찰 포인트는 `agent-team-detective.md`를 참고하세요.

---

## 구현 완료 상태

- [x] 프로젝트 초기화 (package.json, npm install)
- [x] 데이터 저장소 (data/store.js)
- [x] 인증 미들웨어 (middleware/auth.js + 버그 1)
- [x] 캐릭터 라우트 (routes/characters.js + 버그 2, 3)
- [x] 아이템 라우트 (routes/items.js + 버그 4)
- [x] 전투 라우트 (routes/battles.js + 버그 5, 6)
- [x] 리더보드 라우트 (routes/leaderboard.js + 버그 7)
- [x] 유틸리티 (utils/helpers.js + 버그 8)
- [x] 서버 진입점 (server.js)
- [x] 웹 UI (public/index.html)
- [x] 시나리오 가이드 (agent-team-detective.md)
- [x] 8개 버그 모두 재현 가능 확인
