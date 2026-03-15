# VFIT — Project Document v1.0

**Date:** March 3, 2026
**Status:** Planning Complete → Ready for Development

---

## 1. Project Overview

**VFIT** is a mobile-first Progressive Web App (PWA) designed as an all-in-one AI-powered fitness companion. It combines workout tracking with voice logging, an AI coaching chatbot, progress analytics, and a motivation/engagement system — all accessible from the phone's home screen.

### Core Philosophy

- **Voice-first logging** — eliminate the pain of manual post-workout data entry
- **AI-powered accountability** — daily check-ins, nudges, and personalized coaching
- **Motivation through progression** — streaks, badges, PRs, and visual progress
- **Mobile-first PWA** — installed via "Add to Home Screen," no app store needed
- **Cost-conscious** — free STT, minimal API costs, generous free-tier backend

---

## 2. Target User

Single user (personal app). The user follows a 5-day gym split, works with an online personal coach, and wants a streamlined way to log workouts, track progress, and stay accountable — all from their phone.

---

## 3. Tech Stack

| Layer | Technology | Reason |
|-------|-----------|--------|
| Frontend | React + TypeScript + Vite | Fast build, modern tooling, great PWA support |
| Styling | Tailwind CSS | Utility-first, rapid mobile UI development |
| PWA | Service Worker + Web App Manifest | Installable, offline-capable, push notifications |
| Database | Supabase (PostgreSQL) | Relational DB, generous free tier (500 MB), auth, edge functions |
| Push Notifications | Firebase Cloud Messaging (FCM) | Industry standard for web push on mobile |
| AI / LLM | OpenAI API | gpt-4o-mini (daily tasks), gpt-4o (deep coaching) |
| Speech-to-Text | Web Speech API (browser-native) | Free, optimized for mobile (Google/Apple engines) |
| Photo Storage | Local device (IndexedDB) | Privacy-first, zero storage cost |
| Hosting | Vercel or Netlify | Free tier, perfect for static PWA deployment |

---

## 4. App Structure — 5 Tabs

### Tab 1: Dashboard (Home)

The first screen the user sees. A quick snapshot of the day designed to motivate.

**Components:**

- **Today's Workout Card** — Shows the day's workout (e.g., "Day 3: Back & Biceps") with a tap-to-start button. On rest days, shows "Rest Day — Recovery is growth."
- **Streak Counter** — Fire icon with current workout streak (e.g., "12 days"). Prominently displayed.
- **Today's Weight** — Displays logged weight with a trend arrow (↑ or ↓ vs. 7-day average).
- **Weekly Progress Ring** — Visual ring/bar showing workout completion (e.g., 3/5 done this week).
- **Quick Action Buttons** — "Log Workout," "Voice Log," "Chat with Coach."
- **Motivational Element** — Rotating between: progress stats ("You've lifted 12,450 kg this month!"), AI coach message, or achievement progress ("2 more workouts for your 30-day badge!").

---

### Tab 2: Workouts

The core workout tracking experience.

#### 2.1 Pre-loaded Workout Plan

The user's 5-day split is built into the app. Each day displays:

- Day label (e.g., "Monday — Chest & Triceps")
- List of exercises with expected sets and rep ranges
- Any coach notes per exercise

Example:
```
Monday — Chest & Triceps
1. Flat Bench Press        → 4 sets × 10-12 reps
2. Incline Dumbbell Press  → 3 sets × 12 reps
3. Cable Flyes             → 3 sets × 15 reps
4. Tricep Pushdowns        → 3 sets × 12-15 reps
5. Overhead Tricep Ext.    → 3 sets × 12 reps
6. Dips                    → 3 sets × to failure
```

The workout plan is configurable in Settings.

#### 2.2 Logging Methods

**Method 1: Manual Tap (fallback)**
- Each exercise shows set slots (Set 1, Set 2, Set 3...)
- Tap a set → enter weight + reps
- Simple but tedious — exists as a fallback

**Method 2: Voice Log — Per Exercise**
- Mic button next to each exercise
- User says: "80 kg, 10 reps"
- Web Speech API transcribes → OpenAI extracts → auto-fills the set
- Best for: logging between sets while resting

**Method 3: Voice Log — Full Session Summary**
- "Voice Summary" button at the top of the workout screen
- User speaks a full recap after the session ends:
  "Bench press — first set 80 kg 10 reps, second set 85 kg 8 reps, third set 85 kg 7 reps. Then incline dumbbell 30 kg all three sets 12 reps..."
- Web Speech API transcribes the full summary
- OpenAI parses the transcript into structured data for ALL exercises
- Auto-fills the entire workout log at once
- Best for: quick post-workout logging

#### 2.3 Smart Workout Features

**Previous Performance Display:**
- Next to each exercise, the user's last session data is shown in light grey
- Example: "Last: 80kg × 10, 80kg × 10, 82.5kg × 8"
- Provides instant context for what to aim for

**Progressive Overload Suggestions:**
- If the user has hit the top of their rep range for 2+ sessions, a subtle nudge appears
- Example: "You've done 80kg × 12 twice — try 82.5kg today?"
- Non-intrusive, appears as a small suggestion below the exercise

**PR (Personal Record) Detection:**
- After logging, the app checks if any set is a new PR (by weight, reps, or estimated 1RM)
- If a PR is detected: celebration animation + badge notification
- PR is recorded in the PR Hall of Fame (Progress tab)

#### 2.4 Workout History

- Past sessions listed by date, searchable
- Tap to view full details of any past workout
- Useful for reviewing trends and looking up old numbers

---

### Tab 3: AI Coach (Chat)

A conversational AI assistant that acts as an accountability partner and fitness advisor.

#### 3.1 Daily Morning Check-in

Triggered every morning at a user-configured time via push notification.

The coach asks:
- "Good morning! Let's log your weight."
- "How did you sleep?" (optional: rate 1-5)
- "How are you feeling today?"
- Reminds the user of today's workout

The weight is logged and added to the weight trend graph.

#### 3.2 Post-Workout Review

After a workout is logged, the coach automatically reviews it:
- Highlights key achievements ("You hit a PR on bench press!")
- Notes volume changes ("Your chest volume is up 8% from last week")
- Encouragement if performance was lower ("Lower energy today is normal. How's your sleep and nutrition?")

#### 3.3 Weekly Photo Check-in

Every week (configurable day, default Sunday), the coach prompts:
- "Time for your weekly check-in photo! Take a front and side pic."
- User uploads photos directly in the chat
- Photos are stored locally on device (IndexedDB) — never uploaded to cloud
- Coach acknowledges and logs the check-in
- Photos accessible in the Photo Timeline (Progress tab)

#### 3.4 Weekly Challenges

Each week, the coach sets 1-2 small, achievable challenges:
- "Increase your squat by 2.5kg this week"
- "Complete all 5 workouts this week"
- "Try a new exercise variation"
- Completing challenges earns badges
- Challenges are based on the user's recent performance data

#### 3.5 Missed Workout Nudges

- If it's a workout day and no workout has been logged by a configurable time (default 7 PM):
  "Hey, looks like you haven't hit the gym yet. Everything okay? Remember, consistency beats perfection."
- Gentle, not aggressive — the goal is support, not guilt

#### 3.6 General Fitness Q&A

The user can ask anything:
- "Is it okay to skip leg day if my knees hurt?"
- "How much protein do I need on rest days?"
- "My shoulder hurts during overhead press — alternatives?"

The LLM responds with general fitness knowledge. We can also feed the coach context from the user's real coach's chat transcripts to mimic that coaching style and philosophy.

#### 3.7 Technical Implementation

- **LLM:** OpenAI gpt-4o-mini for daily interactions (cheap, fast), gpt-4o for deeper coaching Q&A
- **System Prompt:** Defines the coach's personality — supportive, knowledgeable, direct but kind. Modeled after the user's real online coach.
- **Context:** Each message includes relevant user data (recent workouts, weight trend, current streak, active challenges) so the coach's responses are personalized.
- **Push Notifications:** Firebase Cloud Messaging for morning check-ins, missed workout nudges, and weekly photo reminders. In-app messages as fallback.

---

### Tab 4: Progress

Visual tracking of all fitness metrics.

#### 4.1 Weight Trend Graph

- Daily weight plotted on a line chart
- 7-day moving average overlay (smooths daily fluctuations)
- Timeframe selector: 1 week, 1 month, 3 months, all time
- Goal weight line (if set)

#### 4.2 Workout Volume Chart

- Weekly total volume (weight × reps × sets) as a bar chart
- Can filter by muscle group or exercise
- Shows progressive overload visually over weeks

#### 4.3 PR Hall of Fame

- List of all personal records by exercise
- Each PR shows: exercise name, weight, reps, estimated 1RM, date achieved
- Sorted by recency (newest PRs at top)
- Badge icon next to each PR

#### 4.4 Photo Timeline

- Scrollable timeline of weekly check-in photos
- Side-by-side comparison mode (select any two dates)
- All photos stored locally on device
- Visual progress is one of the strongest motivators

#### 4.5 Badges & Achievements Showcase

- Trophy case displaying all earned badges
- Locked badges shown in grey with requirements
- Categories: Consistency, Strength, Challenges, Milestones

---

### Tab 5: Nutrition (Simple — v1)

A lightweight daily protein tracker.

- **Daily Protein Goal** — User sets target (e.g., 150g) in Settings
- **Quick Log** — Tap to add protein grams consumed (can add multiple times per day)
- **Progress Bar** — Visual bar showing current intake vs. goal
- **Weekly Average** — Shows average daily protein intake over the past 7 days
- **History** — Simple list of daily protein totals

This is intentionally minimal for v1. Full nutrition tracking (calories, macros, Chronometer integration) is planned for v2.

---

## 5. Motivation & Engagement System

### 5.1 Streak System

- **Workout Streak:** Increments for each scheduled workout day completed. Rest days do NOT break the streak.
- **Photo Streak:** Increments for each consecutive weekly photo check-in.
- **Display:** Fire icon + streak count on the Dashboard, always visible.
- **Streak Milestones:** Special celebrations at 7, 14, 30, 60, 90, 180, 365 days.
- **Streak Protection:** If a streak is about to break (missed workout day), the AI coach sends an urgent but supportive nudge.

### 5.2 Badges & Achievements

| Badge | Requirement |
|-------|------------|
| First Rep | Log your first workout |
| Week Warrior | Complete all workouts in a week |
| 7-Day Streak | 7 consecutive workout days |
| 14-Day Streak | 14 consecutive workout days |
| 30-Day Streak | 30 consecutive workout days |
| 60-Day Streak | 60 consecutive workout days |
| 90-Day Streak | 90 consecutive workout days |
| 365-Day Streak | 365 consecutive workout days (legendary) |
| First PR | Hit your first personal record |
| PR Machine | Hit 10 personal records |
| 100kg Club | Lift 100kg on any exercise |
| Volume King | Highest weekly volume milestone |
| Consistency Champion | 4 weeks without missing a workout |
| Photo Streak (4 weeks) | 4 consecutive weekly photo check-ins |
| Photo Streak (12 weeks) | 12 consecutive weekly photo check-ins |
| Challenge Completer | Complete a weekly challenge |
| Challenge Master | Complete 10 weekly challenges |
| Voice Logger | Use voice logging 10 times |
| Early Bird | Log a workout before 8 AM |
| Night Owl | Log a workout after 9 PM |
| Protein Pro | Hit protein goal 7 days in a row |

### 5.3 Weekly Challenges

- Generated by the AI coach each Monday based on recent performance
- Examples: weight increase targets, completion goals, consistency goals
- Displayed in the Chat tab and on the Dashboard
- Completion triggers a badge + coach congratulation

### 5.4 Motivational Elements on Dashboard

Rotating display showing one of:
- Progress stat: "You've lifted 24,300 kg total this month"
- Streak encouragement: "14-day streak! You're unstoppable"
- Challenge progress: "2 more workouts to complete this week's challenge"
- AI coach message: A personalized motivational nudge

---

## 6. Voice Logging — Technical Flow

```
User speaks into phone mic
        ↓
Web Speech API (browser-native, free)
Transcribes speech to text in real-time
Uses Google's engine on Android, Apple's on iOS
        ↓
Raw transcript text
Example: "bench press first set 80 kg 10 reps
          second set 85 kg 8 reps third set 85 7"
        ↓
OpenAI API (gpt-4o-mini) — text extraction
System prompt instructs the model to parse workout data
        ↓
Structured JSON output
{
  "exercises": [
    {
      "name": "Bench Press",
      "sets": [
        { "set": 1, "weight": 80, "unit": "kg", "reps": 10 },
        { "set": 2, "weight": 85, "unit": "kg", "reps": 8 },
        { "set": 3, "weight": 85, "unit": "kg", "reps": 7 }
      ]
    }
  ]
}
        ↓
Auto-fills workout log in the app
User reviews and confirms
```

**Cost Estimate:** Each voice log text extraction uses ~200-500 tokens input + ~200 tokens output. At gpt-4o-mini pricing, this is roughly $0.0001-$0.0003 per extraction. Even with daily use, monthly cost would be under $0.05.

---

## 7. Push Notifications — Technical Flow

```
Firebase Cloud Messaging (FCM) Setup:
1. Register PWA service worker with FCM
2. Request notification permission from user
3. Store FCM token in Supabase

Notification Triggers (via Supabase Edge Functions + scheduled CRON):
- Morning check-in → Daily at user-configured time
- Missed workout nudge → If no workout logged by configured time on workout days
- Weekly photo reminder → Weekly on configured day
- PR celebration → Immediately after PR detection
- Badge earned → Immediately after badge conditions met
- Weekly challenge → Every Monday morning

Fallback: If push permission denied or unavailable,
notifications appear as in-app messages when the user opens VFIT.
```

---

## 8. Data Model (Supabase / PostgreSQL)

### Core Tables

**profiles**
- id, name, goal_weight, daily_protein_target, weight_unit (kg/lbs), created_at

**workout_plans**
- id, day_of_week, day_label (e.g., "Chest & Triceps"), order, is_rest_day

**plan_exercises**
- id, workout_plan_id, exercise_name, target_sets, target_rep_min, target_rep_max, order, notes

**workout_sessions**
- id, workout_plan_id, date, started_at, completed_at, notes, voice_transcript

**workout_logs**
- id, session_id, exercise_name, set_number, weight, reps, unit, is_pr, created_at

**weight_logs**
- id, date, weight, unit, notes

**protein_logs**
- id, date, grams, meal_label (optional), created_at

**personal_records**
- id, exercise_name, weight, reps, estimated_1rm, achieved_date, session_id

**badges**
- id, badge_key, badge_name, description, icon, earned_at

**streaks**
- id, streak_type (workout/photo), current_count, longest_count, last_active_date

**weekly_challenges**
- id, week_start_date, challenge_text, target_value, current_value, is_completed, completed_at

**photo_checkins**
- id, date, photo_count, notes (photos stored locally in IndexedDB, not in DB)

**chat_messages**
- id, role (user/assistant), content, created_at, metadata (JSON)

**notification_settings**
- id, morning_checkin_time, missed_workout_time, photo_checkin_day, push_enabled, fcm_token

---

## 9. PWA Configuration

### Manifest (manifest.json)
```json
{
  "name": "VFIT",
  "short_name": "VFIT",
  "description": "Your AI-Powered Fitness Companion",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#FF4500",
  "orientation": "portrait",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### Service Worker Responsibilities
- Cache static assets for fast loading
- Handle FCM push notification events
- Background sync for offline workout logging (log offline, sync when back online)

### Install Flow
1. User opens VFIT URL in mobile browser
2. Browser shows "Add to Home Screen" prompt (or user does it manually via Share → Add to Home Screen)
3. App icon appears on home screen
4. Opens in standalone mode (no browser chrome) — feels like a native app

---

## 10. Design Guidelines

- **Dark mode by default** — easier on eyes in gym lighting
- **Theme color:** Deep black background (#0A0A0A) with vibrant orange/red accents (#FF4500)
- **Typography:** Clean, bold, easy to read at arm's length
- **Touch targets:** Large buttons (minimum 48px) — easy to tap with sweaty hands
- **Minimal navigation:** Bottom tab bar with 5 tabs, always accessible
- **Animations:** Subtle celebrations for PRs and badges (confetti, glow effects)
- **Voice button:** Large, prominent mic button — the primary interaction method

---

## 11. v2 Backlog

Features planned for future releases:

### High Priority — Health Data Integrations

**Apple Health Integration (Sleep, Steps, Activity from Apple Watch):**
Apple HealthKit does not provide a backend API — all data stays on-device. Since VFIT is a PWA, direct access is not possible. However, **Apple Shortcuts can read HealthKit data and send it to our backend — no native app needed!**

**Recommended Approach: Apple Shortcuts + Supabase Edge Function**
This approach has been proven by developers in the community and requires zero native app development:

1. Build an Apple Shortcut using the "Find Health Samples" action to read weight, sleep (including core/deep/REM phases), steps, active calories, and heart rate from Apple Health.
2. The Shortcut uses "Get Contents Of" action to send a JSON POST request to a Supabase Edge Function endpoint.
3. The Edge Function receives the data, parses it, and writes to the VFIT database tables.
4. Set the Shortcut as an iOS Automation to run daily (e.g., every morning at 7 AM, or triggered when VFIT app is opened).
5. One limitation: Apple requires the phone to be unlocked for health data access, so the user must tap a notification to confirm the shortcut run — a 2-second daily interaction.

```
Data Flow:
Apple Watch / Fitdays Scale
        ↓
    Apple Health (on-device)
        ↓
    Apple Shortcut ("Find Health Samples")
        ↓
    HTTP POST (JSON) → Supabase Edge Function
        ↓
    VFIT Database (PostgreSQL)
        ↓
    VFIT PWA reads & displays data
```

**Fallback Options (if Shortcuts approach has limitations):**
- **Option B: Companion iOS App** — Minimal native app to read HealthKit and push to Supabase. More seamless but requires Apple Developer account ($99/year).
- **Option C: Terra API** — Third-party bridge service. Simpler but ongoing costs.

**Data we want from Apple Health:** weight (from Fitdays via Apple Health sync), sleep duration & phases (core/deep/REM from Apple Watch), daily steps, active calories burned, resting heart rate, workout activity data.

**Priority: This could be implemented as early as v1.5 since the Shortcuts approach requires no native app, no third-party costs, and minimal backend work (one Supabase Edge Function).**

**Fitdays Integration (Weight from Smart Scale):**
Fitdays does not have a public API. However, Fitdays syncs data to Apple Health. So the data flow would be: **Fitdays smart scale → Fitdays app → Apple Health → Apple Shortcut → Supabase → VFIT.** Solving the Apple Health integration via Shortcuts automatically gives us Fitdays weight data. This would replace manual weight logging in the daily check-in — the AI coach could auto-pull your morning weight instead of asking you to type it.

### Other v2 Features

- Rest timer between sets (auto-start after logging a set)
- Weekly AI-generated summary reports
- Full nutrition tracking (calories, carbs, fats + protein)
- Chronometer integration for food data
- Workout duration tracking
- Water intake tracker
- Sleep quality logging (manual in v1, auto from Apple Watch in v2)
- Shareable workout summary cards (for social media)
- Data export (CSV/PDF)
- Multiple workout plan support
- Exercise library with video demos
- Body measurements tracking (arms, chest, waist, etc.)

---

## 12. Development Phases

### Phase 1: Foundation
- Project setup (React + Vite + TypeScript + Tailwind)
- PWA configuration (manifest, service worker)
- Supabase setup (database, tables, auth)
- Basic app shell with 5-tab navigation
- Dark theme implementation

### Phase 2: Workout Core
- Workout plan display
- Manual workout logging
- Workout history
- Previous performance display

### Phase 3: Voice Logging
- Web Speech API integration
- OpenAI API integration for text extraction
- Per-exercise voice logging
- Full session voice summary logging
- Review & confirm flow

### Phase 4: AI Coach
- Chat interface
- OpenAI-powered responses with user context
- Daily check-in flow (weight, mood)
- Post-workout review
- Weekly photo check-in prompt
- Weekly challenge generation

### Phase 5: Progress & Motivation
- Weight trend graph (with 7-day moving average)
- Workout volume chart
- PR detection & Hall of Fame
- Photo timeline with side-by-side comparison
- Badge system implementation
- Streak tracking & display

### Phase 6: Notifications & Polish
- Firebase Cloud Messaging setup
- Push notification triggers (morning check-in, missed workout, etc.)
- Protein tracker
- Settings page
- Performance optimization
- Final UI polish & animations

---

*This document is the single source of truth for the VFIT project. Update it as decisions evolve.*
