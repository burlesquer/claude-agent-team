# Claude Agent Team - RPG Detective Scenario

Claude Code 에이전트 팀 기능을 실습하기 위한 프로젝트입니다.

의도적으로 8개의 버그가 숨겨진 미니 RPG 게임 API를 에이전트 팀이 "탐정단"이 되어 수사하는 시나리오를 제공합니다.

## 빠른 시작

```bash
cd rpg-api
npm install
node server.js
```

브라우저에서 `http://localhost:3000` 접속하면 게임 UI를 사용할 수 있습니다.

## 프로젝트 구조

```
.
├── rpg-api/                    # 미니 RPG 게임 API (의도적 버그 포함)
│   ├── server.js               # Express 서버 진입점
│   ├── public/index.html       # 게임 웹 UI
│   ├── middleware/auth.js      # JWT 인증
│   ├── routes/                 # API 라우트 (characters, items, battles, leaderboard)
│   ├── data/store.js           # 인메모리 데이터 저장소
│   └── utils/helpers.js        # 유틸리티
├── agent-team-detective.md     # 탐정 수사 시나리오 가이드
├── PLAN.md                     # 구현 계획
└── CLAUDE.md                   # Claude Code 프로젝트 설정
```

## RPG API

### 기술 스택
- Node.js + Express
- JWT 인증
- 인메모리 데이터 저장 (DB 없음)
- 단일 파일 웹 UI (HTML/CSS/JS)

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

### 캐릭터 클래스

| 클래스 | HP | ATK | DEF | SPD |
|---|---|---|---|---|
| Warrior | 120 | 15 | 12 | 8 |
| Mage | 80 | 20 | 6 | 10 |
| Rogue | 90 | 18 | 8 | 15 |
| Healer | 100 | 8 | 10 | 9 |

## 탐정 수사 시나리오

이 API에는 **의도적으로 8개의 버그**가 숨겨져 있습니다:
- 보안 취약점 3개
- 로직 버그 3개
- 성능 이슈 2개

Claude Code의 에이전트 팀 기능을 사용하여 이 버그들을 찾아내는 시나리오입니다.

### 체험할 수 있는 에이전트 팀 기능

- **TeamCreate** / **TeamDelete** - 팀 생성 및 정리
- **TaskCreate** / **TaskUpdate** - 작업 목록 및 종속성 관리
- **SendMessage** - 팀원 간 직접 메시지 / broadcast
- **Plan Mode** - 수사 계획 제출 및 승인
- **위임 모드** - 리더가 코드를 직접 보지 않고 조율
- **shutdown_request** - 팀원 종료 프로토콜

자세한 시나리오 프롬프트와 실행 방법은 [`agent-team-detective.md`](agent-team-detective.md)를 참고하세요.

## 라이선스

학습 및 실습 목적으로 자유롭게 사용하세요.
