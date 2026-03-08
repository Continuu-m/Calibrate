# TODO: Calibrate Implementation Tracker

This list tracks the remaining work for Person 2 and Person 3 based on the PRD and current project status.

## 📱 Person 2: Experience Builder (Full-Stack)
*Current Focus: Completing interactive features and external integrations.*

- [ ] **Daily Dashboard Intelligence**
    - [x] Mobile responsiveness shells
    - [x] Replace mock sum logic with actual capacity calculator API
    - [x] Integrate ML-powered breakdown generator (Person 1 API)
    - [x] Implement live "Burnout Risk" alerts based on backend events
- [ ] **Weekly Planning Interface**
    - [x] Mobile-friendly 7-day grid
    - [x] Drag-and-drop task rescheduling logic
    - [x] Overcommitment heatmap visualization
    - [x] "Suggested Redistribution" toggle UI
- [ ] **Intelligent Task Breakdown UI**
    - [x] Basic subtask display
    - [x] Integrate ML-powered breakdown generator (Person 1 API)
    - [x] Add "Implicit Task" detection markers
- [ ] **Detailed Task View**
    - [ ] Build sub-navigation for single task management
    - [ ] Dependency visualization (links between tasks)
    - [x] Confidence score indicators (best/realistic/worst cases)
- [ ] **External Integrations**
    - [x] Google Calendar OAuth flow
    - [x] Outlook Calendar OAuth flow
    - [ ] Real-time sync status indicator
- [ ] **User Onboarding**
    - [ ] Interactive walkthrough for first-time users
    - [x] Initial "Preference Setting" flow

## 🏗️ Person 3: Foundation Builder (Product/Backend)
*Current Focus: Business logic, capacity engine, and launch operations.*

- [ ] **Infrastructure & Security**
    - [x] Basic Auth and JWT Session management
    - [x] API Rate Limiting for all endpoints
    - [] Mobile-specific security (Biometric/PIN fallback)
- [ ] **Data Governance & Privacy**
    - [ ] Encryption at rest for PII (Personal Identifiable Information)
    - [ ] GDPR Data Export utility
    - [ ] "Right to be Forgotten" (Full account/data deletion) logic
- [ ] **Advanced Capacity Engine**
    - [x] Code the context-switching penalty (15m after 4th task)
    - [x] Meeting recovery logic (30m buffer after sync events)
    - [ ] Dynamic "Energy Budget" tracker
- [ ] **Alert & Notification System**
    - [x] Overcommitment severity classifier (Caution vs Warning vs Critical)
    - [x] Email digest generator (Daily Summary)
    - [ ] In-app notification bus
- [ ] **Beta Program Operations**
    - [ ] Feedback collection tool integration (PostHog/Mixpanel)
    - [ ] Beta user enrollment and activation tracking
    - [ ] In-app survey triggers
- [ ] **Monetization & Go-To-Market**
    - [ ] Stripe API integration for subscriptions
    - [ ] Beta-to-Paid conversion logic
    - [ ] Public-facing Marketing Landing Page
