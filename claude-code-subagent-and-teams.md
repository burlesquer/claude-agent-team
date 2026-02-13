# Claude Code: 서브 에이전트 & 에이전트 팀 완전 정리

> 출처: [Sub-agents](https://code.claude.com/docs/ko/sub-agents) | [Agent Teams](https://code.claude.com/docs/ko/agent-teams) | [Features Overview](https://code.claude.com/docs/ko/features-overview)

---

## 목차

- [1. 서브 에이전트 (Sub-agents)](#1-서브-에이전트-sub-agents)
  - [1.1 개념](#11-개념)
  - [1.2 해결하는 문제](#12-해결하는-문제)
  - [1.3 내장 서브 에이전트 3종](#13-내장-서브-에이전트-3종)
  - [1.4 정의 파일 구조](#14-정의-파일-구조)
  - [1.5 Frontmatter 필드](#15-frontmatter-필드)
  - [1.6 범위(Scope) 및 우선순위](#16-범위scope-및-우선순위)
  - [1.7 포그라운드 vs 백그라운드 실행](#17-포그라운드-vs-백그라운드-실행)
  - [1.8 컨텍스트 관리](#18-컨텍스트-관리)
  - [1.9 지속적 메모리](#19-지속적-메모리-persistent-memory)
  - [1.10 Hook을 통한 조건부 제어](#110-hook을-통한-조건부-제어)
  - [1.11 주요 사용 패턴](#111-주요-사용-패턴)
  - [1.12 예제 서브 에이전트](#112-예제-서브-에이전트)
- [2. 에이전트 팀 (Agent Teams)](#2-에이전트-팀-agent-teams)
  - [2.1 개념](#21-개념)
  - [2.2 서브 에이전트 vs 에이전트 팀](#22-서브-에이전트-vs-에이전트-팀-핵심-비교)
  - [2.3 아키텍처](#23-아키텍처-구성-요소)
  - [2.4 활성화 및 시작](#24-활성화-및-시작)
  - [2.5 표시 모드](#25-표시-모드)
  - [2.6 통신 메커니즘](#26-통신-메커니즘)
  - [2.7 컨텍스트 및 권한](#27-컨텍스트-및-권한)
  - [2.8 작업 할당 및 청구](#28-작업-할당-및-청구)
  - [2.9 계획 승인 모드](#29-계획-승인-모드)
  - [2.10 위임 모드](#210-위임-모드-delegation-mode)
  - [2.11 최적 사용 사례](#211-최적-사용-사례)
  - [2.12 모범 사례](#212-모범-사례)
  - [2.13 제한 사항](#213-제한-사항)
- [3. Features Overview: 서브 에이전트 관련](#3-features-overview-서브-에이전트-관련)
  - [3.1 확장 계층에서의 위치](#31-확장-계층에서의-위치)
  - [3.2 Skill vs Subagent](#32-skill-vs-subagent-비교)
  - [3.3 CLAUDE.md vs Skill](#33-claudemd-vs-skill-비교)
  - [3.4 서브 에이전트 컨텍스트 로딩 상세](#34-서브-에이전트-컨텍스트-로딩-상세)
  - [3.5 기능 결합 패턴](#35-기능-결합-패턴)
  - [3.6 컨텍스트 비용 이해](#36-컨텍스트-비용-이해)
- [4. 동작 원리 요약 다이어그램](#4-동작-원리-요약-다이어그램)

---

## 1. 서브 에이전트 (Sub-agents)

### 1.1 개념

서브 에이전트는 **특정 유형의 작업을 처리하는 특화된 AI 어시스턴트**다.

핵심 특성:

- **자체 컨텍스트 윈도우**에서 실행 (메인 대화와 분리)
- **커스텀 시스템 프롬프트**, 특정 도구 액세스, 독립적 권한 보유
- Claude가 서브 에이전트의 `description`과 일치하는 작업을 만나면 **자동 위임**
- 독립적으로 작동 후 **결과만 메인 대화로 반환**
- **다른 서브 에이전트를 생성할 수 없음** (중첩 불가)

### 1.2 해결하는 문제

| 목적 | 설명 |
|---|---|
| **컨텍스트 보존** | 탐색/구현을 메인 대화에서 분리하여 컨텍스트 윈도우 절약 |
| **제약 조건 적용** | 사용 가능한 도구를 제한 (예: 읽기 전용) |
| **구성 재사용** | 사용자 수준 서브 에이전트로 프로젝트 간 재사용 |
| **동작 특화** | 특정 도메인을 위한 집중 시스템 프롬프트 |
| **비용 제어** | Haiku 같은 저렴한 모델로 작업 라우팅 |

### 1.3 내장 서브 에이전트 3종

#### Explore (탐색 에이전트)

- **모델**: Haiku (빠름, 낮은 지연)
- **도구**: 읽기 전용 (Write/Edit 거부)
- **용도**: 파일 검색, 코드 검색, 코드베이스 탐색
- 철저함 레벨 지정 가능: `quick`, `medium`, `very thorough`

#### Plan (계획 에이전트)

- **모델**: 메인 대화에서 상속
- **도구**: 읽기 전용 (Write/Edit 거부)
- **용도**: Plan mode에서 코드베이스 연구, 계획 수립 전 컨텍스트 수집

#### General-purpose (범용 에이전트)

- **모델**: 메인 대화에서 상속
- **도구**: 모든 도구
- **용도**: 탐색 + 수정 모두 필요한 복잡한 다단계 작업

#### 기타 내장 에이전트

| 에이전트 | 모델 | 용도 |
|---|---|---|
| Bash | 상속 | 별도 컨텍스트에서 터미널 명령 실행 |
| statusline-setup | Sonnet | `/statusline` 실행 시 상태 표시줄 구성 |
| Claude Code Guide | Haiku | Claude Code 기능에 대한 질문 응답 |

### 1.4 정의 파일 구조

서브 에이전트는 **YAML frontmatter가 있는 Markdown 파일**로 정의한다:

```markdown
---
name: code-reviewer
description: Reviews code for quality and best practices
tools: Read, Glob, Grep
model: sonnet
---

You are a code reviewer. When invoked, analyze the code and provide
specific, actionable feedback on quality, security, and best practices.
```

- **Frontmatter** = 메타데이터 + 구성
- **본문(Markdown)** = 시스템 프롬프트

> 서브 에이전트는 이 시스템 프롬프트만 받는다. Claude Code 전체 시스템 프롬프트는 받지 않는다.

### 1.5 Frontmatter 필드

| 필드 | 필수 | 설명 |
|---|---|---|
| `name` | O | 고유 식별자 (소문자, 하이픈) |
| `description` | O | Claude가 위임 시기를 결정하는 데 사용 |
| `tools` | X | 사용 가능 도구 허용 목록. 생략 시 모든 도구 상속 |
| `disallowedTools` | X | 거부할 도구 목록 |
| `model` | X | `sonnet`, `opus`, `haiku`, `inherit` (기본값: `inherit`) |
| `permissionMode` | X | `default`, `acceptEdits`, `dontAsk`, `bypassPermissions`, `plan` |
| `skills` | X | 시작 시 컨텍스트에 미리 로드할 Skills 목록 |
| `hooks` | X | 서브 에이전트 범위 라이프사이클 Hook |
| `memory` | X | 지속 메모리 범위: `user`, `project`, `local` |

### 1.6 범위(Scope) 및 우선순위

| 위치 | 범위 | 우선순위 |
|---|---|---|
| `--agents` CLI 플래그 | 현재 세션만 | **1 (최고)** |
| `.claude/agents/` | 현재 프로젝트 | 2 |
| `~/.claude/agents/` | 모든 프로젝트 | 3 |
| 플러그인의 `agents/` 디렉토리 | 플러그인 활성화 위치 | **4 (최저)** |

같은 이름의 서브 에이전트가 여러 곳에 존재하면 **높은 우선순위가 승리**한다.

**CLI 정의 서브 에이전트** (세션 전용, 디스크 미저장):

```bash
claude --agents '{
  "code-reviewer": {
    "description": "Expert code reviewer. Use proactively after code changes.",
    "prompt": "You are a senior code reviewer...",
    "tools": ["Read", "Grep", "Glob", "Bash"],
    "model": "sonnet"
  }
}'
```

### 1.7 포그라운드 vs 백그라운드 실행

| 항목 | 포그라운드 | 백그라운드 |
|---|---|---|
| **메인 대화** | 완료까지 차단 | 동시에 계속 작업 |
| **권한 프롬프트** | 사용자에게 전달 | 사전 승인된 것만 사용, 나머지 자동 거부 |
| **MCP 도구** | 사용 가능 | **사용 불가** |
| **전환** | - | `Ctrl+B`로 실행 중 작업을 백그라운드로 이동 |

> `CLAUDE_CODE_DISABLE_BACKGROUND_TASKS=1`로 백그라운드 기능 완전 비활성화 가능

### 1.8 컨텍스트 관리

#### 재개 (Resume)

- 기본적으로 각 호출은 **새 인스턴스** 생성
- 이전 서브 에이전트를 재개하면 모든 도구 호출/결과/추론을 포함한 **전체 대화 기록 유지**
- 트랜스크립트 위치: `~/.claude/projects/{project}/{sessionId}/subagents/agent-{agentId}.jsonl`

```
# 재개 예시
Use the code-reviewer subagent to review the authentication module
[에이전트 완료]

Continue that code review and now analyze the authorization logic
[Claude가 이전 컨텍스트로 서브 에이전트 재개]
```

#### 자동 압축

- 약 95% 용량에서 자동 압축 트리거
- `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE`로 조절 가능 (예: `50`으로 더 일찍 트리거)
- 메인 대화 압축은 서브 에이전트 트랜스크립트에 **영향 없음** (별도 파일)
- 트랜스크립트는 `cleanupPeriodDays` (기본 30일)에 따라 자동 정리

### 1.9 지속적 메모리 (Persistent Memory)

`memory` 필드로 대화 간 유지되는 지식 기반을 구축한다:

```yaml
---
name: code-reviewer
description: Reviews code for quality and best practices
memory: user
---
```

| 범위 | 저장 위치 | 용도 |
|---|---|---|
| `user` | `~/.claude/agent-memory/<name>/` | 모든 프로젝트에서 학습 유지 (권장 기본값) |
| `project` | `.claude/agent-memory/<name>/` | 프로젝트 특정, VCS 공유 가능 |
| `local` | `.claude/agent-memory-local/<name>/` | 프로젝트 특정, VCS 제외 |

활성화 시:

- 시스템 프롬프트에 메모리 디렉토리 읽기/쓰기 지침 포함
- `MEMORY.md`의 처음 200줄이 시스템 프롬프트에 포함
- Read, Write, Edit 도구가 자동 활성화

### 1.10 Hook을 통한 조건부 제어

도구의 **일부 사용만 허용**해야 할 때 `PreToolUse` hook 사용:

```yaml
---
name: db-reader
description: Execute read-only database queries
tools: Bash
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/validate-readonly-query.sh"
---
```

검증 스크립트 예시:

```bash
#!/bin/bash
INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# SQL 쓰기 작업 차단 (대소문자 무관)
if echo "$COMMAND" | grep -iE '\b(INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE)\b' > /dev/null; then
  echo "Blocked: Only SELECT queries are allowed" >&2
  exit 2  # 종료 코드 2 = 실행 차단
fi

exit 0  # 종료 코드 0 = 허용
```

#### 서브 에이전트에서 지원되는 Hook 이벤트

| 이벤트 | Matcher 입력 | 실행 시기 |
|---|---|---|
| `PreToolUse` | 도구 이름 | 서브 에이전트가 도구 사용하기 전 |
| `PostToolUse` | 도구 이름 | 서브 에이전트가 도구 사용한 후 |
| `Stop` | (없음) | 서브 에이전트 완료 시 (`SubagentStop`으로 변환) |

#### 프로젝트 수준 서브 에이전트 Hook (settings.json)

| 이벤트 | Matcher 입력 | 실행 시기 |
|---|---|---|
| `SubagentStart` | 에이전트 유형 이름 | 서브 에이전트 실행 시작 시 |
| `SubagentStop` | (없음) | 모든 서브 에이전트 완료 시 |

#### 특정 서브 에이전트 비활성화

```json
{
  "permissions": {
    "deny": ["Task(Explore)", "Task(my-custom-agent)"]
  }
}
```

또는 CLI 플래그:

```bash
claude --disallowedTools "Task(Explore)"
```

### 1.11 주요 사용 패턴

| 패턴 | 설명 | 예시 |
|---|---|---|
| **대량 작업 격리** | 많은 출력을 생성하는 작업을 분리, 요약만 반환 | `Use a subagent to run the test suite and report only the failing tests` |
| **병렬 연구** | 여러 서브 에이전트를 동시 생성하여 독립적 조사 | `Research the auth, database, and API modules in parallel using separate subagents` |
| **서브 에이전트 체인** | 순차적으로 서브 에이전트 사용 | `Use the code-reviewer to find issues, then use the optimizer to fix them` |

#### 메인 대화 vs 서브 에이전트 선택 기준

**메인 대화를 사용할 때:**

- 빈번한 왕복/반복적 개선이 필요
- 여러 단계가 상당한 컨텍스트를 공유 (계획 → 구현 → 테스트)
- 빠르고 대상 변경
- 지연시간이 중요 (서브 에이전트는 새로 시작하므로 시간 소요)

**서브 에이전트를 사용할 때:**

- 메인 컨텍스트에 불필요한 자세한 출력 생성
- 특정 도구 제한/권한을 적용
- 자체 포함되어 요약 반환 가능한 작업

### 1.12 예제 서브 에이전트

#### 코드 검토자 (읽기 전용)

```markdown
---
name: code-reviewer
description: Expert code review specialist. Proactively reviews code for quality,
  security, and maintainability. Use immediately after writing or modifying code.
tools: Read, Grep, Glob, Bash
model: inherit
---

You are a senior code reviewer ensuring high standards of code quality and security.

When invoked:
1. Run git diff to see recent changes
2. Focus on modified files
3. Begin review immediately

Review checklist:
- Code is clear and readable
- Functions and variables are well-named
- No duplicated code
- Proper error handling
- No exposed secrets or API keys
- Input validation implemented
- Good test coverage
- Performance considerations addressed

Provide feedback organized by priority:
- Critical issues (must fix)
- Warnings (should fix)
- Suggestions (consider improving)
```

#### 디버거 (수정 가능)

```markdown
---
name: debugger
description: Debugging specialist for errors, test failures, and unexpected behavior.
  Use proactively when encountering any issues.
tools: Read, Edit, Bash, Grep, Glob
---

You are an expert debugger specializing in root cause analysis.

When invoked:
1. Capture error message and stack trace
2. Identify reproduction steps
3. Isolate the failure location
4. Implement minimal fix
5. Verify solution works

For each issue, provide:
- Root cause explanation
- Evidence supporting the diagnosis
- Specific code fix
- Testing approach
- Prevention recommendations
```

#### 데이터 과학자

```markdown
---
name: data-scientist
description: Data analysis expert for SQL queries, BigQuery operations, and data insights.
  Use proactively for data analysis tasks and queries.
tools: Bash, Read, Write
model: sonnet
---

You are a data scientist specializing in SQL and BigQuery analysis.

When invoked:
1. Understand the data analysis requirement
2. Write efficient SQL queries
3. Use BigQuery command line tools (bq) when appropriate
4. Analyze and summarize results
5. Present findings clearly
```

---

## 2. 에이전트 팀 (Agent Teams)

### 2.1 개념

> **실험적 기능** - 기본 비활성화. 활성화 필요.

에이전트 팀은 **여러 Claude Code 인스턴스가 함께 작동하도록 조율**하는 시스템이다:

- 한 세션이 **팀 리더** 역할 → 작업 조율, 할당, 결과 종합
- 팀원들은 **각각의 컨텍스트 윈도우에서 독립 작동**
- 서브 에이전트와 달리 **리더를 거치지 않고 팀원 간 직접 통신 가능**
- 사용자도 **개별 팀원과 직접 상호작용** 가능

### 2.2 서브 에이전트 vs 에이전트 팀 핵심 비교

| 항목 | 서브 에이전트 | 에이전트 팀 |
|---|---|---|
| **컨텍스트** | 자체 윈도우, 결과는 호출자에게 반환 | 자체 윈도우, 완전히 독립적 |
| **통신** | 메인 에이전트에게만 보고 | 팀원 간 **직접 메시지** 가능 |
| **조율** | 메인 에이전트가 모든 작업 관리 | **공유 작업 목록**으로 자체 조율 |
| **최적 용도** | 결과만 중요한 집중 작업 | 논의/협업이 필요한 복잡한 작업 |
| **토큰 비용** | 낮음 (요약만 반환) | **높음** (각 팀원이 별도 인스턴스) |
| **중첩** | 불가 (서브→서브 생성 불가) | 불가 (팀원→팀 생성 불가) |

> **선택 기준**: 워커들이 **서로 통신해야 하면** 에이전트 팀, **결과만 필요하면** 서브 에이전트.

### 2.3 아키텍처 구성 요소

| 구성 요소 | 역할 |
|---|---|
| **팀 리더** | 팀 생성, 팀원 생성, 작업 조율하는 메인 Claude Code 세션 |
| **팀원** | 각각 할당된 작업에서 독립 작동하는 별도 Claude Code 인스턴스 |
| **작업 목록** | 팀원들이 청구/완료하는 **공유 작업 항목 목록** |
| **메일박스** | 에이전트 간 통신을 위한 **메시징 시스템** |

**저장 위치:**

- 팀 구성: `~/.claude/teams/{team-name}/config.json`
- 작업 목록: `~/.claude/tasks/{team-name}/`

`config.json`에는 각 팀원의 `name`, `agentId`, `agentType`이 포함된 `members` 배열이 있다. 팀원들은 이 파일을 읽어 다른 멤버를 발견할 수 있다.

### 2.4 활성화 및 시작

#### 활성화

셸 환경이나 `settings.json`에서:

```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

#### 팀 시작 방식

1. **사용자가 명시적으로 팀 요청** → Claude가 지시에 따라 팀 생성
2. **Claude가 팀 제안** → 작업이 병렬화에 유리하다고 판단 시 확인 후 생성

> 두 경우 모두 **사용자 승인 없이 팀을 만들지 않는다**.

#### 시작 예시

```
I'm designing a CLI tool that helps developers track TODO comments across
their codebase. Create an agent team to explore this from different angles:
one teammate on UX, one on technical architecture, one playing devil's advocate.
```

### 2.5 표시 모드

| 모드 | 설명 | 요구 사항 |
|---|---|---|
| **In-process** | 모든 팀원이 메인 터미널 내에서 실행. `Shift+Up/Down`으로 선택 | 없음 (모든 터미널) |
| **분할 창** | 각 팀원이 자신의 창 보유. 클릭으로 직접 상호작용 | tmux 또는 iTerm2 |

기본값: `"auto"` (tmux 세션 내면 분할, 아니면 in-process)

설정:

```json
{
  "teammateMode": "in-process"
}
```

또는 CLI 플래그:

```bash
claude --teammate-mode in-process
```

### 2.6 통신 메커니즘

#### 정보 공유 방법

- **자동 메시지 전달**: 팀원이 메시지를 보내면 수신자에게 자동 전달 (폴링 불필요)
- **유휴 알림**: 팀원이 완료/중지 시 자동으로 리더에게 알림
- **공유 작업 목록**: 모든 에이전트가 작업 상태를 보고 청구 가능

#### 메시지 타입

| 타입 | 설명 | 비용 |
|---|---|---|
| `message` | 특정 팀원 1명에게 DM | 단일 메시지 |
| `broadcast` | 모든 팀원에게 동시 전송 | N명 = N개 메시지 (비쌈, 드물게 사용) |

### 2.7 컨텍스트 및 권한

#### 컨텍스트

팀원 생성 시 받는 것:

- 일반 세션과 동일한 프로젝트 컨텍스트: `CLAUDE.md`, MCP servers, skills
- 리더의 **생성 프롬프트**

받지 않는 것:

- 리더의 **대화 기록**

#### 권한

- 팀원은 **리더의 권한 설정으로 시작**
- 리더가 `--dangerously-skip-permissions`면 팀원도 동일
- 생성 후 개별 변경은 가능하지만, 생성 시 팀원별 모드 지정은 불가

### 2.8 작업 할당 및 청구

작업 상태: **대기 중 → 진행 중 → 완료됨**

할당 방식:

- **리더 할당**: 리더에게 어느 작업을 누구에게 줄지 지시
- **자체 청구**: 팀원이 완료 후 다음 미할당/차단되지 않은 작업을 스스로 선택

> 작업 청구는 **파일 잠금**으로 경합 조건 방지. 종속성이 있는 작업은 해당 종속성 완료 시 자동 차단 해제.

### 2.9 계획 승인 모드

복잡/위험한 작업 시 팀원에게 **구현 전 계획을 요구**할 수 있다:

```
Spawn an architect teammate to refactor the authentication module.
Require plan approval before they make any changes.
```

**흐름:**

1. 팀원이 읽기 전용 계획 모드에서 계획 작성
2. 리더에게 계획 승인 요청 전송
3. 리더가 검토 후 승인 또는 피드백과 함께 거부
4. 거부 시 → 팀원이 계획 수정 후 재제출
5. 승인 시 → 계획 모드 종료, 구현 시작

> 리더의 판단 기준 설정: "테스트 커버리지를 포함하는 계획만 승인" 등

### 2.10 위임 모드 (Delegation Mode)

리더가 직접 구현하지 않고 **조율만 하도록 제한**:

- 가능한 것: 팀원 생성, 메시징, 종료, 작업 관리
- `Shift+Tab`으로 위임 모드 전환
- 리더가 직접 코드를 작성하는 것을 방지

### 2.11 최적 사용 사례

| 사용 사례 | 설명 | 예시 프롬프트 |
|---|---|---|
| **연구 및 검토** | 여러 팀원이 문제의 다양한 측면을 동시 조사 후 서로 도전 | 보안/성능/테스트 각각 별도 검토자 |
| **새 모듈/기능** | 팀원 각자 별도 부분을 소유하여 간섭 없이 작업 | 4명의 팀원이 모듈별로 리팩토링 |
| **경쟁 가설 디버깅** | 다양한 이론을 병렬 테스트, 서로 반박하며 빠르게 수렴 | 5명이 각자 다른 가설 조사 후 과학적 토론 |
| **교차 계층 조율** | 프론트엔드/백엔드/테스트 각각 다른 팀원이 소유 | 프론트/백/테스트 팀원 생성 |

#### 사용 사례 예시: 병렬 코드 검토

```
Create an agent team to review PR #142. Spawn three reviewers:
- One focused on security implications
- One checking performance impact
- One validating test coverage
Have them each review and report findings.
```

#### 사용 사례 예시: 경쟁 가설 조사

```
Users report the app exits after one message instead of staying connected.
Spawn 5 agent teammates to investigate different hypotheses. Have them talk to
each other to try to disprove each other's theories, like a scientific
debate. Update the findings doc with whatever consensus emerges.
```

> 토론 구조가 핵심: 서로의 이론을 반박하려고 할 때, 살아남은 이론이 실제 근본 원인일 가능성이 높다.

### 2.12 모범 사례

#### 팀원에게 충분한 컨텍스트 제공

팀원은 CLAUDE.md/MCP/skills를 자동 로드하지만 **리더의 대화 기록은 상속하지 않는다**. 생성 프롬프트에 작업별 세부 사항을 포함:

```
Spawn a security reviewer teammate with the prompt: "Review the authentication
module at src/auth/ for security vulnerabilities. Focus on token handling,
session management, and input validation. The app uses JWT tokens stored
in httpOnly cookies. Report any issues with severity ratings."
```

#### 작업 크기 적절히 조정

| 크기 | 문제 |
|---|---|
| **너무 작음** | 조율 오버헤드 > 이점 |
| **너무 큼** | 체크인 없이 너무 오래 작동 → 낭비 위험 |
| **적절함** | 명확한 결과물을 생성하는 자체 포함 단위 |

> 팀원당 5~6개 작업을 유지하면 모두 생산적. 막힘 시 리더가 재할당 가능.

#### 파일 충돌 피하기

두 팀원이 동일 파일 편집 시 덮어쓰기 발생. **각 팀원이 다른 파일 집합을 소유**하도록 작업 분해.

#### 팀원 완료 대기

리더가 직접 구현 시작 시:

```
Wait for your teammates to complete their tasks before proceeding
```

#### 모니터링

팀원 진행 상황 확인, 비효율적 접근 재지정, 발견 사항 종합. 팀을 무인으로 오래 실행하면 낭비 위험 증가.

### 2.13 제한 사항

| 제한 | 설명 |
|---|---|
| **세션 재개 불가** | `/resume`, `/rewind`는 in-process 팀원을 복원하지 않음 |
| **작업 상태 지연** | 팀원이 완료 표시를 누락하여 종속 작업이 차단될 수 있음 |
| **종료 지연** | 현재 요청/도구 호출 완료 후 종료 |
| **세션당 1팀** | 새 팀 시작 전 현재 팀 정리 필요 |
| **중첩 팀 불가** | 팀원이 자체 팀/팀원 생성 불가 |
| **리더 고정** | 팀 생성 세션이 수명 동안 리더. 승격/이전 불가 |
| **생성 시 권한 고정** | 모든 팀원이 리더 권한으로 시작. 팀원별 모드 지정 불가 |
| **분할 창 제한** | VS Code 통합 터미널, Windows Terminal, Ghostty 미지원 |

#### 팀 정리

```
Clean up the team
```

> 항상 **리더가 정리 실행**. 팀원이 정리하면 리소스가 일관성 없는 상태로 남을 수 있다.

#### 고아 tmux 세션 정리

```bash
tmux ls
tmux kill-session -t <session-name>
```

---

## 3. Features Overview: 서브 에이전트 관련

### 3.1 확장 계층에서의 위치

| 기능 | 역할 | 로드 시기 | 컨텍스트 비용 |
|---|---|---|---|
| **CLAUDE.md** | 매 세션 지속 컨텍스트 | 세션 시작 | 모든 요청 |
| **Skills** | 온디맨드 지식/워크플로우 | 설명: 시작 시, 전체: 사용 시 | 낮음 |
| **MCP** | 외부 서비스 연결 | 세션 시작 | 모든 요청 |
| **Subagents** | 격리된 컨텍스트에서 자체 루프 | 온디맨드 (생성 시) | **메인에서 격리** |
| **Agent teams** | 여러 독립 세션 조정 | 온디맨드 | **매우 높음** |
| **Hooks** | 결정론적 스크립트, 루프 외부 | 트리거 시 | 0 |

### 3.2 Skill vs Subagent 비교

| 측면 | Skill | Subagent |
|---|---|---|
| **정의** | 재사용 가능한 지침/지식/워크플로우 | 자체 컨텍스트를 가진 격리된 워커 |
| **주요 이점** | 컨텍스트 간 콘텐츠 공유 | 컨텍스트 격리, 요약만 반환 |
| **최적 용도** | 참조 자료, 호출 가능 워크플로우 | 많은 파일 읽기, 병렬 작업, 특화 워커 |

**결합 가능:**

- 서브 에이전트의 `skills:` 필드로 특정 Skill을 미리 로드
- Skill은 `context: fork`로 격리된 컨텍스트에서 실행 가능

### 3.3 CLAUDE.md vs Skill 비교

| 측면 | CLAUDE.md | Skill |
|---|---|---|
| **로드** | 모든 세션, 자동으로 | 온디맨드 |
| **파일 포함** | `@path` 가져오기 사용 | `@path` 가져오기 사용 |
| **워크플로우 트리거** | 불가 | `/<name>` 사용 가능 |
| **최적 용도** | "항상 X를 하기" 규칙 | 참조 자료, 호출 가능 워크플로우 |

> **경험 법칙:** CLAUDE.md를 약 500줄 이하로 유지. 증가하면 참조 콘텐츠를 Skill로 이동.

### 3.4 서브 에이전트 컨텍스트 로딩 상세

서브 에이전트가 생성될 때 **받는 것:**

1. **시스템 프롬프트** (캐시 효율성을 위해 부모와 공유)
2. `skills:` 필드에 나열된 **Skill의 전체 콘텐츠**
3. **CLAUDE.md 및 git 상태** (부모에서 상속)
4. 리더가 프롬프트에서 전달하는 **모든 컨텍스트**

**받지 않는 것:**

- 부모의 **대화 기록**
- 부모가 호출한 **Skill**
- Claude Code **전체 시스템 프롬프트** (자체 시스템 프롬프트만 받음)

### 3.5 기능 결합 패턴

| 패턴 | 동작 방식 | 예시 |
|---|---|---|
| **Skill + MCP** | MCP가 연결 제공, Skill이 사용법 문서화 | MCP: DB 연결 / Skill: 스키마 및 쿼리 패턴 |
| **Skill + Subagent** | Skill이 병렬 작업을 위해 서브 에이전트 생성 | `/review` → 보안, 성능, 스타일 서브 에이전트 시작 |
| **CLAUDE.md + Skills** | CLAUDE.md는 항상 켜진 규칙, Skill은 온디맨드 참조 | CLAUDE.md: "API 규칙 따르기" / Skill: 전체 API 가이드 |
| **Hook + MCP** | Hook이 MCP를 통해 외부 작업 트리거 | 편집 후 Hook → Slack 알림 전송 |

### 3.6 컨텍스트 비용 이해

| 기능 | 로드 시기 | 로드되는 것 | 컨텍스트 비용 |
|---|---|---|---|
| **CLAUDE.md** | 세션 시작 | 전체 콘텐츠 | 모든 요청 |
| **Skills** | 시작 시 + 사용 시 | 시작 시 설명, 사용 시 전체 | 낮음 (설명만 매 요청) |
| **MCP 서버** | 세션 시작 | 모든 도구 정의 및 스키마 | 모든 요청 (도구 검색으로 최적화) |
| **Subagents** | 생성 시 | 신선한 컨텍스트 + 지정 Skill | **주 세션에서 격리** |
| **Hooks** | 트리거 시 | 없음 (외부 실행) | 0 |

> Skill에 `disable-model-invocation: true` 설정 시 수동 호출 전까지 컨텍스트 비용 0.

---

## 4. 동작 원리 요약 다이어그램

### 서브 에이전트 구조

```
┌─────────────────────────────────────────────────────────────┐
│                       사용자 (User)                          │
│                          │                                  │
│               ┌──────────▼──────────┐                       │
│               │   메인 Claude 세션    │                        │
│               │                     │                        │
│               └──┬───────┬───────┬──┘                        │
│                  │       │       │                            │
│       ┌──────────▼──┐ ┌──▼──────────┐ ┌──▼──────────┐       │
│       │ 서브 에이전트  │ │ 서브 에이전트 │ │ 서브 에이전트 │       │
│       │ (Explore)   │ │ (Custom)    │ │ (General)   │       │
│       │             │ │             │ │             │       │
│       │ 결과 반환 ↑   │ │ 결과 반환 ↑  │ │ 결과 반환 ↑  │       │
│       └─────────────┘ └─────────────┘ └─────────────┘       │
│                                                              │
│       서브 에이전트: 메인에게만 보고, 서로 통신 불가                  │
└─────────────────────────────────────────────────────────────┘
```

### 에이전트 팀 구조

```
┌─────────────────────────────────────────────────────────────┐
│                  에이전트 팀 (Agent Teams)                     │
│                                                              │
│       ┌──────────────┐                                       │
│       │   팀 리더      │◄─── 사용자 직접 상호작용                 │
│       └──┬───┬───┬───┘                                       │
│          │   │   │   메시지 + 작업 목록                         │
│       ┌──▼─┐ │ ┌─▼──┐                                        │
│       │팀원A│◄─►│팀원B│  ◄── 팀원 간 직접 통신 가능                │
│       └──┬─┘ │ └─┬──┘                                        │
│          │ ┌─▼──┐ │                                          │
│          └►│팀원C│◄┘    ◄── 사용자도 개별 팀원과 직접 대화 가능      │
│            └────┘                                            │
│                                                              │
│       [공유 작업 목록]  ◄── 파일 잠금으로 경합 방지                 │
│       [메일박스]       ◄── 자동 메시지 전달                       │
└─────────────────────────────────────────────────────────────┘
```

### 전환점 판단

```
단순 작업              복잡한 작업              팀 협업 필요
    │                      │                      │
    ▼                      ▼                      ▼
메인 대화에서 직접   →   서브 에이전트 위임   →   에이전트 팀 생성
                    (컨텍스트 격리)          (피어 투 피어 통신)
                    (결과만 반환)            (공유 작업 목록)
                    (낮은 토큰)             (높은 토큰)
```
