# Claude Agent Team - 가위바위보 도박장

## Project Overview
가위바위보 도박장 API + 탐정 수사 에이전트 팀 실습 프로젝트.
의도적으로 8개의 버그가 숨겨져 있으며, 에이전트 팀이 탐정단이 되어 수사하는 시나리오.

## Structure
- `rpg-api/` - 가위바위보 도박장 API (Node.js + Express, 인메모리)
- `agent-team-detective.md` - 탐정 수사 시나리오 가이드
- `PLAN.md` - 구현 계획서

## RPG API
- **Stack**: Node.js, Express, JWT auth, in-memory data (no DB)
- **Entry point**: `rpg-api/server.js` (exports `app` for testing)
- **Start**: `cd rpg-api && npm install && node server.js` (port 3000)
- **Web UI**: 브라우저에서 `http://localhost:3000` 접속
- **IMPORTANT**: 8개의 의도적 버그가 포함됨. 명시적으로 요청하지 않는 한 수정 금지.
  - 3 보안 취약점 (auth.js, users.js)
  - 3 로직 버그 (game.js)
  - 2 성능 이슈 (ranking.js, helpers.js)

## Commands
- `cd rpg-api && npm install` - 의존성 설치
- `cd rpg-api && node server.js` - 서버 실행
- `cd rpg-api && npm test` - 테스트 실행 (jest + supertest)

## Code Style
- Pure JavaScript (no TypeScript)
- Express router pattern: `routes/` 디렉토리에 리소스별 파일
- 한국어 문서 및 커뮤니케이션 우선
