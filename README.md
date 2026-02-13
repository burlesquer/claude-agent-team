# Claude Agent Team - 가위바위보 도박장

Claude Code 에이전트 팀 기능을 실습하기 위한 프로젝트입니다.

의도적으로 8개의 버그가 숨겨진 가위바위보 도박장을 에이전트 팀이 "탐정단"이 되어 수사하는 시나리오를 제공합니다.

## 빠른 시작

```bash
cd rpg-api
npm install
node server.js
```

브라우저에서 `http://localhost:3000` 접속

## 게임 규칙

1. 회원가입하면 1000 코인 지급
2. 가위/바위/보 선택 + 코인 베팅
3. 이기면 베팅액만큼 획득, 지면 베팅액 차감
4. 3연승 보너스 500코인
5. 랭킹은 코인 보유량 기준

## 프로젝트 구조

```
rpg-api/
├── server.js              # Express 서버 (인증)
├── public/index.html      # 게임 웹 UI
├── middleware/auth.js      # JWT 인증
├── routes/
│   ├── users.js           # 유저 목록/검색
│   ├── game.js            # 가위바위보 게임
│   └── ranking.js         # 랭킹
├── data/store.js          # 인메모리 저장소
└── utils/helpers.js       # 유틸리티
```

## 탐정 수사 시나리오

이 서버에는 **의도적으로 8개의 버그**가 숨겨져 있습니다:
- 보안 취약점 3개 (인증 우회, ReDoS, 정보 노출)
- 로직 버그 3개 (음수 베팅, 패널티 음수화, off-by-one)
- 성능 이슈 2개 (O(n*m) 루프, 동기 I/O)

Claude Code 에이전트 팀으로 이 버그를 찾아내는 시나리오입니다.

자세한 실행 방법은 [`agent-team-detective.md`](agent-team-detective.md)를 참고하세요.

## 라이선스

학습 및 실습 목적으로 자유롭게 사용하세요.
