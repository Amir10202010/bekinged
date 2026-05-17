# BEKINGED

> Turning checkers into a daily competitive habit.

## Overview

BEKINGED is a modern social-competitive platform for checkers built for the next generation of players.

Instead of treating checkers like an old offline board game, BEKINGED transforms it into a:

* competitive online experience
* daily habit platform
* social gaming product
* AI-assisted training environment

The project combines realtime multiplayer, ranking systems, puzzles, analytics, streak mechanics, and modern UI/UX into one platform.

---

# Elevator Pitch

**BEKINGED** is a social-competitive checkers platform with realtime multiplayer, AI coaching, ranking systems, puzzles, and streak mechanics.

Our goal is to make checkers feel modern, addictive, and community-driven — similar to how Duolingo gamified learning or Chess.com modernized chess.

---

# Problem

Traditional checkers platforms are:

* outdated
* visually unattractive
* not social-first
* missing progression systems
* missing modern engagement mechanics
* weak on mobile/web experience

Young users are used to:

* streaks
* leaderboards
* daily challenges
* matchmaking
* realtime experiences
* social profiles
* modern design systems

Most existing checkers products fail to deliver that experience.

---

# Solution

BEKINGED introduces:

## Competitive Multiplayer

* realtime online matches
* matchmaking queue
* game rooms
* live move synchronization
* ELO ranking system

## AI-Assisted Training

* move analysis
* mistake detection
* suggested improvements
* tactical puzzle system

## Habit & Engagement Mechanics

* daily challenges
* streak systems
* progression tracking
* leaderboards
* player profiles

## Modern Product Experience

* responsive UI
* realtime updates
* smooth animations
* dark/light themes
* startup-quality branding

---

# Current Features

## Authentication

* signup/login flow
* Supabase authentication
* protected app structure

## Gameplay

* checkers game engine
* move validation
* board state management
* multiplayer foundation

## Multiplayer Infrastructure

* Socket.io realtime server
* matchmaking architecture
* game rooms
* synchronized gameplay

## User System

* player profiles
* leaderboard page
* ELO utilities
* match history foundation

## Content Features

* puzzles page
* AI analysis utilities
* settings system

---

# Technical Architecture

## Frontend

* Next.js 14
* TypeScript
* TailwindCSS
* Framer Motion
* Zustand

## Backend

* Node.js
* Socket.io
* Fastify/Express-style realtime architecture

## Database & Auth

* Supabase
* PostgreSQL
* Prisma ORM

## Infrastructure

* Vercel (frontend hosting)
* Railway (realtime websocket server)

---

# Project Structure

```txt
src/
 ├── app/
 │    ├── (marketing)/
 │    ├── (app)/
 │    └── api/
 │
 ├── components/
 ├── hooks/
 ├── lib/
 │    ├── game/
 │    ├── supabase/
 │    └── socket.ts
 │
 └── store/

server/
 ├── index.ts
 ├── matchmaking.ts
 └── rooms.ts

prisma/
 └── schema.prisma
```

---

# Product Vision

The long-term vision is to become:

* the most modern checkers platform
* a social gaming ecosystem
* an AI-powered training environment
* a competitive esports-style experience for checkers

Future roadmap includes:

* tournaments
* spectator mode
* voice/game chat
* AI coach
* achievements system
* mobile application
* creator/community systems
* replay analysis
* anti-cheat systems

---

# Why This Project Matters

BEKINGED is not just a school project.

This project demonstrates:

* full-stack engineering
* realtime systems design
* multiplayer architecture
* database modeling
* modern frontend architecture
* startup product thinking
* UX/UI product design
* scalable infrastructure planning

The project was intentionally designed with production-style architecture and startup-oriented execution.

---

# Deployment Architecture

## Frontend

Hosted on Vercel.

## Multiplayer Realtime Server

Hosted on Railway.

## Database

Hosted on Supabase PostgreSQL.

---

# Local Development

## Install dependencies

```bash
npm install
```

## Start frontend

```bash
npm run dev
```

## Start multiplayer server

```bash
cd server
npm install
npm run dev
```

---

# Environment Variables

```env
DATABASE_URL=
DIRECT_URL=

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

NEXT_PUBLIC_SOCKET_URL=
```

---

# Database

Run Prisma migrations:

```bash
npx prisma migrate deploy
```

or:

```bash
npx prisma db push
```

---

# Author

Amirkhan Sagyndyk

Student developer building modern competitive gaming products.

---

# Status

Current stage:

MVP / Incubator Prototype

The project is actively being developed and expanded with multiplayer, AI systems, and social features.
