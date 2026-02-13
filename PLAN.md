# 계획: 가위바위보 도박장 + 탐정 수사 에이전트 팀 시나리오

## Context

에이전트 팀의 **모든 기능**(팀 생성, 작업 목록, 작업 종속성, 직접 메시지, 계획 승인, 위임 모드, broadcast, 자체 청구, 종료, 정리)을 자연스럽게 체험할 수 있는 실습 환경이 필요하다.

**접근 방식**: 의도적으로 8개의 버그가 숨겨진 가위바위보 도박장 API를 먼저 만들고, 에이전트 팀이 "탐정단"이 되어 이 코드의 문제를 수사하는 시나리오를 구성한다.

---

## Part 1: 가위바위보 도박장 API

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
├── server.js              # Express 서버 (회원가입/로그인)
├── public/
│   └── index.html         # 게임 웹 UI (다크 테마)
├── middleware/
│   └── auth.js            # JWT 인증 (버그 1)
├── routes/
│   ├── users.js           # 유저 목록/검색 (버그 2, 3)
│   ├── game.js            # 가위바위보 게임 (버그 4, 5, 6)
│   └── ranking.js         # 랭킹 (버그 7)
├── data/
│   └── store.js           # 인메모리 저장소
└── utils/
    └── helpers.js         # 유틸리티 (버그 8)
```

### 게임 규칙
1. 회원가입하면 1000 코인 지급
2. 가위/바위/보 선택 + 코인 베팅
3. 이기면 베팅액만큼 획득, 지면 베팅액 차감
4. 3연승 보너스 500코인
5. 랭킹은 코인 보유량 기준

### 숨긴 버그 목록 (8개)

#### 보안 취약점
1. **인증 우회** (`middleware/auth.js`) - Bearer 대소문자 비교 → `bearer`로 보내면 `jwt.decode` 서명 미검증 (★★☆)
2. **ReDoS** (`routes/users.js`) - `new RegExp(userInput)` 직접 사용 (★★★)
3. **정보 노출** (`routes/users.js`) - 유저 목록에 `password_hash` 노출 (★☆☆)

#### 로직 버그
4. **음수 베팅** (`routes/game.js`) - 음수 베팅 미검증 → 지면 코인 증가 (★★☆)
5. **패널티 음수화** (`routes/game.js`) - `bet - winStreak*10` → 연승 높으면 지는데 코인 증가 (★★★)
6. **off-by-one** (`routes/game.js`) - 3연승 보너스 `> 3` 대신 `>= 3` 필요 (★☆☆)

#### 성능 이슈
7. **O(n*m) 랭킹** (`routes/ranking.js`) - 캐싱 없는 중첩 루프 (★★☆)
8. **동기 I/O** (`utils/helpers.js`) - `fs.appendFileSync` 블로킹 (★☆☆)

### API 엔드포인트

| 메서드 | 경로 | 설명 |
|---|---|---|
| POST | /auth/register | 회원가입 (1000코인 지급) |
| POST | /auth/login | 로그인 (JWT 발급) |
| GET | /users | 유저 목록 |
| GET | /users/search?name= | 유저 검색 |
| GET | /users/me | 내 정보 |
| POST | /game/play | 가위바위보 (choice + bet) |
| GET | /game/history | 게임 기록 |
| GET | /ranking | 랭킹 |
| GET | /health | 서버 상태 |

---

## Part 2: 탐정 수사 에이전트 팀 시나리오

### 시나리오 설정

> "가위바위보 도박장 서버에서 심각한 이상 현상이 보고됐다. 유저들이 인증 없이 접속하고, 지는데 코인이 늘어나고, 비밀번호가 노출되는 사례가 속출한다. 탐정 팀을 파견하여 모든 문제를 찾아내고 수사 보고서를 작성하라."

### 팀 구성 (5명)

| 역할 | 담당 | 사용할 에이전트 팀 기능 |
|---|---|---|
| **수사반장** (리더) | 조율 전용 | 위임 모드, 작업 할당 |
| **보안 전문가** | auth.js, users.js | 계획 승인, 직접 메시지 |
| **포렌식 분석가** | game.js | 계획 승인, 가설 공유 |
| **성능 프로파일러** | ranking.js, helpers.js | 자체 청구, 직접 메시지 |
| **QA 수사관** | tests/ | 작업 종속성 |

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
- [x] 유저 라우트 (routes/users.js + 버그 2, 3)
- [x] 게임 라우트 (routes/game.js + 버그 4, 5, 6)
- [x] 랭킹 라우트 (routes/ranking.js + 버그 7)
- [x] 유틸리티 (utils/helpers.js + 버그 8)
- [x] 서버 진입점 (server.js)
- [x] 웹 UI (public/index.html - 다크 테마, 한글)
- [x] 시나리오 가이드 (agent-team-detective.md)
- [x] 8개 버그 모두 재현 가능 확인
