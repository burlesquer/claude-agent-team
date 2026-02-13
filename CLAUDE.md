# Claude Agent Team - Practice Project

## Project Overview
This is a training/practice project for Claude Code agent team features.
It contains a deliberately buggy RPG API (`rpg-api/`) and scenario guides.

## Structure
- `rpg-api/` - Mini RPG Game API (Node.js + Express, in-memory storage)
- `agent-team-detective.md` - Detective scenario guide for agent team practice
- `agent-team-practice.md` - General agent team practice notes
- `claude-code-subagent-and-teams.md` - Subagent/team reference docs
- `PLAN.md` - Implementation plan for the RPG API + detective scenario

## RPG API
- **Stack**: Node.js, Express, JWT auth, in-memory data (no DB)
- **Entry point**: `rpg-api/server.js` (exports `app` for testing)
- **Start**: `cd rpg-api && npm install && node server.js` (port 3000)
- **IMPORTANT**: The API contains 8 intentional bugs for training purposes. Do NOT fix them unless explicitly asked.
  - 3 security vulnerabilities (auth.js, characters.js)
  - 3 logic bugs (items.js, battles.js)
  - 2 performance issues (leaderboard.js, helpers.js)

## Commands
- `cd rpg-api && npm install` - Install dependencies
- `cd rpg-api && node server.js` - Start server
- `cd rpg-api && npm test` - Run tests (jest + supertest)

## Code Style
- Pure JavaScript (no TypeScript)
- Express router pattern: one file per resource in `routes/`
- Korean language preferred for documentation and user communication
