# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VFIT is a mobile-first PWA — an AI-powered fitness companion with voice-first workout logging, AI coaching chatbot, progress analytics, and a motivation/engagement system. Single-user personal app (no multi-tenancy).

## Tech Stack

- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Database:** Supabase (PostgreSQL) — auth, edge functions, realtime
- **AI/LLM:** OpenAI API — gpt-4o-mini (daily tasks), gpt-4o (deep coaching)
- **Speech-to-Text:** Web Speech API (browser-native, free)
- **Push Notifications:** Firebase Cloud Messaging (FCM)
- **Photo Storage:** IndexedDB (local device only, never cloud)
- **Hosting:** Vercel or Netlify (static PWA)
- **PWA:** Service worker + web app manifest, standalone display mode

## Architecture

Five-tab mobile app: Dashboard, Workouts, AI Coach (Chat), Progress, Nutrition.

### Key Data Flow — Voice Logging
User speaks → Web Speech API transcribes → OpenAI gpt-4o-mini extracts structured JSON → auto-fills workout log → user reviews and confirms.

### Key Data Flow — AI Coach
User context (recent workouts, weight trend, streak, challenges) is included with each message → OpenAI generates personalized coaching responses.

### Database Tables (Supabase)
profiles, workout_plans, plan_exercises, workout_sessions, workout_logs, weight_logs, protein_logs, personal_records, badges, streaks, weekly_challenges, photo_checkins, chat_messages, notification_settings

## Design Guidelines

- Dark mode by default — background #0A0A0A, accent #FF4500 (orange/red)
- Minimum 48px touch targets
- Bottom tab bar navigation (5 tabs)
- Portrait orientation, standalone PWA mode
- Large prominent mic button for voice-first interaction

## Project Document

The full spec lives at `docs/VFIT_Project_Document.md` — it is the single source of truth for requirements, data model, and feature details.
