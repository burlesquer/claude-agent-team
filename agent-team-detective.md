# RPG API 탐정 수사 에이전트 팀 시나리오

## 개요

의도적으로 8개의 버그와 보안 이슈가 숨겨진 미니 RPG 게임 API(`rpg-api/`)를 에이전트 팀이 "탐정단"이 되어 수사하는 시나리오입니다.

## 사전 준비

```bash
cd rpg-api
npm install
node server.js
```

서버가 `http://localhost:3000`에서 실행됩니다.

---

## 시나리오 프롬프트

아래 프롬프트를 Claude Code에 그대로 붙여넣으세요:

```
RPG 게임 서버(rpg-api/)에서 심각한 이상 현상이 보고됐어.
유저들이 무한 HP를 얻고, 아이템이 복제되고, 인증을 우회하는 사례가 속출해.
탐정 팀을 구성해서 모든 문제를 찾아내고 수사 보고서를 작성해줘.

에이전트 팀을 팀원 4명으로 만들어. 각 팀원은 Sonnet 모델을 사용해.

- 보안 전문가: 인증, 인젝션, 정보 노출 등 보안 취약점을 수사해
  - 담당 파일: middleware/auth.js, routes/characters.js (보안 관점)
  - 수사 전에 반드시 수사 계획을 제출해서 승인받아야 해

- 포렌식 분석가: 게임 로직 버그를 수사해 (아이템 복제, 전투 오류 등)
  - 담당 파일: routes/items.js, routes/battles.js
  - 수사 전에 반드시 수사 계획을 제출해서 승인받아야 해

- 성능 프로파일러: 성능 병목 지점을 수사해
  - 담당 파일: routes/leaderboard.js, utils/helpers.js
  - 수사 계획 승인 없이 자유롭게 수사 가능

- QA 수사관: 다른 팀원들이 발견한 버그를 재현하는 테스트 코드를 작성해
  - 담당 파일: tests/ 디렉토리
  - 다른 팀원들이 버그를 최소 3개 이상 발견한 후에 작업 시작해 (작업 종속성)

수사 규칙:
1. 나(수사반장)는 위임 모드로 운영해. 코드를 직접 보지 않고 조율만 할 거야.
2. 보안 전문가와 포렌식 분석가는 수사 계획 승인이 필요해.
   승인 기준: 조사할 파일과 의심되는 취약점 유형이 명시되어야 함.
3. 팀원들은 서로 직접 메시지를 보내서 발견한 단서를 공유해야 해.
   특히 보안 이슈와 로직 버그가 연관될 수 있으니 보안 전문가와
   포렌식 분석가는 반드시 소통해야 해.
4. 치명적인 취약점을 발견하면 broadcast로 전체 팀에 즉시 알려.
5. QA 수사관은 다른 팀원들의 발견을 기다린 후 테스트를 작성해.
6. 모든 수사가 끝나면 수사 보고서를 다음 형식으로 종합해줘:
   - 발견된 문제 목록 (심각도 순)
   - 각 문제의 영향 범위
   - 재현 방법
   - 권장 수정 방안

수사를 시작해. 먼저 작업 목록을 만들고 팀원들에게 할당해줘.
내가 위임 모드로 전환할 때까지 기다려.
```

---

## 체험할 에이전트 팀 기능

| Phase | 기능 | 설명 |
|-------|------|------|
| 1 | **TeamCreate** | 탐정 팀 생성 |
| 1 | **위임 모드 (Shift+Tab)** | 수사반장은 조율만, 코드 안 만짐 |
| 1 | **작업 목록 (TaskCreate)** | 수사 작업 생성 |
| 1 | **작업 종속성** | QA 수사관은 다른 팀원 발견에 의존 |
| 1 | **계획 승인 (plan mode)** | 보안 전문가, 포렌식 분석가의 수사 계획 승인 |
| 2 | **계획 승인/거부** | 수사반장이 계획 검토 |
| 2 | **병렬 작업** | 보안/포렌식/성능 동시 수사 |
| 2 | **직접 메시지 (SendMessage)** | 포렌식↔보안 단서 공유 |
| 2 | **자체 청구** | 성능 프로파일러가 추가 작업 자체 청구 |
| 3 | **broadcast** | 치명적 취약점 발견 시 전체 알림 |
| 3 | **팀원 간 토론** | 인증 우회 + 아이템 복제 연관성 토론 |
| 3 | **작업 차단 해제** | 버그 발견 → QA 작업 차단 해제 |
| 4 | **QA 테스트 작성** | 발견된 버그 재현 테스트 |
| 4 | **결과 종합** | 수사 보고서 작성 |
| 5 | **팀원 종료 (shutdown_request)** | 각 팀원 종료 |
| 5 | **팀 정리 (TeamDelete)** | 팀 리소스 정리 |

---

## 숨겨진 버그 목록 (정답지 - 수사 후 확인용)

<details>
<summary>🔍 정답 보기 (수사 완료 후 클릭)</summary>

### 보안 취약점

| # | 파일 | 버그 | 난이도 |
|---|------|------|--------|
| 1 | `middleware/auth.js` | JWT Bearer 대소문자 비교로 인증 우회 (`bearer`로 보내면 `jwt.decode`로 서명 검증 없이 통과) | ★★☆ |
| 2 | `routes/characters.js` | 검색 시 `new RegExp(userInput)` 직접 사용 → ReDoS 공격 가능 | ★★★ |
| 3 | `routes/characters.js` | 캐릭터 목록에 다른 유저의 `password_hash` 필드 노출 | ★☆☆ |

### 로직 버그

| # | 파일 | 버그 | 난이도 |
|---|------|------|--------|
| 4 | `routes/items.js` | 아이템 거래 시 얕은 복사로 객체 참조 공유 → 아이템 복제/연동 | ★★★ |
| 5 | `routes/battles.js` | 방어력 > 공격력일 때 음수 데미지 → HP 증가 (무한 HP) | ★★☆ |
| 6 | `routes/battles.js` | 레벨업 조건 `>` 대신 `>=` 필요 (off-by-one) | ★☆☆ |

### 성능 이슈

| # | 파일 | 버그 | 난이도 |
|---|------|------|--------|
| 7 | `routes/leaderboard.js` | 매 요청마다 O(n*m) 중첩 루프, 캐싱 없음 | ★★☆ |
| 8 | `utils/helpers.js` | `fs.appendFileSync` 동기 I/O로 이벤트 루프 블로킹 | ★☆☆ |

</details>

---

## 관찰 포인트

시나리오 실행 중 다음을 관찰하세요:

1. **팀 생성 과정**: TeamCreate가 팀 설정 파일과 작업 목록 디렉토리를 어떻게 만드는지
2. **계획 모드 워크플로**: 보안 전문가/포렌식 분석가가 계획을 제출하고 수사반장이 승인/거부하는 흐름
3. **병렬 수사**: 여러 팀원이 동시에 다른 파일을 조사하는 모습
4. **팀원 간 소통**: DM과 broadcast의 차이, 정보가 어떻게 전파되는지
5. **작업 종속성**: QA 수사관이 다른 팀원의 발견을 기다리는 메커니즘
6. **자체 청구**: 성능 프로파일러가 추가 작업을 스스로 가져가는 방식
7. **종료 프로토콜**: shutdown_request → shutdown_response → TeamDelete 순서

---

## API 테스트 예시 (curl)

```bash
# 회원가입
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123"}'

# 로그인
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123"}'

# 캐릭터 생성 (TOKEN을 로그인 응답의 token으로 교체)
curl -X POST http://localhost:3000/characters \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"name":"Warrior1","characterClass":"warrior"}'

# 인증 우회 버그 테스트 (bearer 소문자)
curl -X GET http://localhost:3000/characters \
  -H "Authorization: bearer FAKE_TOKEN_HERE"
```
