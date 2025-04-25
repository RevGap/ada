# CHARLIE Product Requirements Document

## 1. Introduction
**Purpose & Scope**  
CHARLIE is the evolution of ADA into a multimodal, voice-first, collaborative assistant—"Jarvis for today"—powered by camera, screenshare, and advanced context models.

## 1.1 Design Principles  
- Lean, evolvable core: start with WebSocket-driven voice & chat, layer vision later.  
- External inference service: Flash₂.₅ runs outside the FastAPI app to minimize latency.  
- Composable Context Providers: `VoiceContext`, `VisionContext` for real-time state via React context.  

## 2. Key Features
1. **UI/UX Redesign**  
   - Full-screen dark holoscreen with neon accents, particle/waveform background  
   - Four regions: top bar (avatar, time/status), left dock, central chat, right context sidebar  
2. **Camera-Powered Workspace Authentication**  
   - Face detection & embeddings (face-api.js) for workspace profiles  
   - PIN/voice fallback for 2FA layering  
3. **Multimodal Context (Flash₂.₅)**  
   - “Show Cam” overlay to extract objects/scenes and auto-inject into prompts  
4. **Screenshare & Collaborative Editing**  
   - Puppeteer capture + real-time sync via Socket.IO  
5. **Voice-First Interface & Hotkey Mute**  
   - Wake-word (“Hey Charlie…”), live transcription, user-configurable mute hotkey  
6. **Dynamic Widget Management**  
   - Generate, open, close widgets on demand  
7. **Reactive Animations & Voice Feedback**  
   - Avatar nods, pulsing icons, chat bubbles slide in  
8. **Predictive Context & Suggestions**  
   - Smart replies, next-step suggestions, one-click summarization  
9. **Gesture & Emotion Signals**  
   - Hand-raise to mute/unmute, facial emotion cues for UI tone  
10. **Deep Productivity Integrations**  
   - Calendar/email plugins, file-system watchers trigger widgets  
11. **Mobile Responsive Design**  
   - Layout and interactions adapt seamlessly from desktop to mobile  
12. **Audit & Analytics Dashboard**  
   - Usage metrics, security logs, memory graph visualization  
13. **Third-Party Model & API Integrations**  
   - OpenRouter/Hugging Face for flexible LLM & multimodal model support

## 3. Future Opportunities
- **Plugin/Extension Ecosystem**  
- **Cross-Device Sync & Mobile Companion**  
- **Offline/Local-First Fallback**

## 4. Architecture
- **Client**: React + Vite + Socket.IO + Three.js; App.jsx utilizes `VoiceContext` & `VisionContext`  
- **Server**: Python FastAPI (app.py) + WebSocket-driven voice & chat  
- **Flash₂.₅ Layer**: external inference service (via MCP0 or custom)  
- **Auth Service**: face embeddings DB  
- **Third-Party API Layer**: OpenRouter/Hugging Face

## 5. Milestones & Timeline
- **M1**: Design system & layout skeleton (App.jsx)  
- **M2**: AuthWidget & camera feed  
- **M3**: Flash₂.₅ pipeline + Show Cam button  
- **M4**: Screenshare widget & collaboration API  
- **M5**: Voice interface & hotkey integration  
- **M6**: Widget manager & animations polish  
- **M7**: Predictive suggestions & analytics dashboard

## 6. Next Steps
- Create Git PR: draft `docs/PRD.md`  
- Kick off Sprint M1: implement layout in `App.jsx`
