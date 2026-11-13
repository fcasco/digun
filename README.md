# Articulation Training: Strategic Reframing Terminal

An interactive spaced-repetition card game and mastery deck designed to train strategic verbal communication reframes (*"Don't say A, say B"*). 

Rooted in **Responsibility Exchange Theory** and communication psychology, the application trains speakers, engineers, and leaders to replace subconscious "danger phrases" (over-apologizing, hedging, self-undermining) with authoritative, empathetic "power reframes" that honor the listener while preserving dignity and credibility.

Styled in **Theme #12 (Retro Terminal Console)** featuring deep CRT phosphor aesthetics, amber trigger alerts, emerald power reframes, monospace hierarchy, and procedural tactile key acoustics.

---

## ⚡ Core Features

- **5-Box Leitner Spaced Repetition Engine**:
  - Automatically schedules review intervals from Box 1 (1 day) to Box 5 (14 days / Mastered).
  - Four rating choices: `[1] Again` (reset to Box 1), `[2] Hard` (maintain interval), `[3] Good` (advance box), and `[4] Easy` (fast-track +2 boxes).
  - Due card queue detection and session graduation analytics.
- **70+ Curated Strategic Reframes** across 5 psychological pillars:
  1. *Apologies to Gratitude* (e.g. `"Sorry I'm late"` $\to$ `"Thank you for waiting for me"`)
  2. *Confidence & Assertiveness* (e.g. `"I might be wrong, but..."` $\to$ `"Here's what I understand..."`)
  3. *Diplomatic Disagreement* (e.g. `"You're wrong"` $\to$ `"I see it differently"`)
  4. *Problems to Solutions* (e.g. `"I'm so busy"` $\to$ `"I have a lot on my plate, and I'd love your help prioritizing"`)
  5. *Graceful Praise Acceptance* (e.g. `"Oh, it was a bargain / nothing"` $\to$ `"Thank you"`)
- **Speech Synthesis (TTS)**: Instant voice articulation playback via the browser's Web Speech API with rate controls (0.8x, 1.0x, 1.2x) to model vocal cadence and downward inflections.
- **Tactile Terminal Acoustics**: Procedural Web Audio API synthesizer generating authentic mechanical keyboard clicks, relay card flips, and chord chimes (muteable with state persistence).
- **16 Interactive Scenario Drills**: "Spot the Power Reframe" challenge mode with category filters, shuffle, and real-time psychological debriefs.
- **Leitner Vault & Custom Cards**: Visual 5-box distribution matrix, search filter, drawer inspector, custom reframe card creator, and JSON backup export/import.
- **Keyboard Shortcuts**: Complete hands-on-keyboard support (`Space` to flip, `1`–`4` to grade, `A` to speak, `[?]` for command cheat sheet).

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Dev Server**: [Vite 8](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Audio & Speech**: Browser-native [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) and [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) (zero external audio dependencies or API keys required)
- **Data Persistence**: LocalStorage with schema versioning and JSON export/import

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 20+ recommended, 18+ supported)
- [npm](https://www.npmjs.com/) (version 9+)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/<your-username>/<your-repo-name>.git
   cd <your-repo-name>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Vite development server on port 3000 with host binding. |
| `npm run build` | Compiles TypeScript and builds the production bundle into `dist/`. |
| `npm run preview` | Locally serves the production build in `dist/` for inspection. |
| `npm run lint` | Runs TypeScript compilation checks (`tsc --noEmit`) to verify types. |
| `npm run clean` | Deletes build artifacts (`dist/`). |

---

## 🌐 GitHub Pages Deployment

This repository includes an automated GitHub Actions deployment workflow at `.github/workflows/deploy.yml`.

### One-Time GitHub Configuration:
1. Go to your repository on GitHub.
2. Navigate to **Settings** $\to$ **Pages**.
3. Under **Build and deployment** $\to$ **Source**, select **GitHub Actions**.
4. Every commit or merge to the `main` branch will automatically build and publish the application.

---

## 📂 Project Structure

```
├── .github/
│   └── workflows/
│       └── deploy.yml            # Automated GitHub Pages CI/CD workflow
├── src/
│   ├── components/
│   │   ├── Header.tsx            # Terminal 3-zone top bar and audio HUD
│   │   ├── FlashcardDeck.tsx     # 3D spaced repetition flashcard player
│   │   ├── ScenarioQuiz.tsx      # Multi-choice situational articulation challenge
│   │   ├── LeitnerVault.tsx      # 5-box distribution matrix and card browser
│   │   ├── ThemesAndPsychology.tsx # The 12 UI themes & behavioral science foundations
│   │   └── KeyboardShortcutsModal.tsx # Command keyboard shortcuts modal
│   ├── data/
│   │   └── defaultCards.ts       # 22+ curated reframes, 12 UI themes, and quiz scenarios
│   ├── types/
│   │   └── reframe.ts            # TypeScript interfaces for cards, boxes, and quizzes
│   ├── utils/
│   │   ├── leitnerStorage.ts     # Leitner retention algorithm and localStorage sync
│   │   ├── soundEffects.ts       # Web Audio API synthesizer for tactile terminal clicks
│   │   └── speechSynthesis.ts   # Web Speech API wrapper for spoken articulation
│   ├── App.tsx                   # Main state machine and application shell
│   ├── index.css                 # Phosphor glow, scanline overlays, and typography
│   └── main.tsx                  # React DOM entry point
├── index.html                    # HTML shell with IBM Plex Mono font preconnects
├── package.json                  # Scripts and package dependencies
├── tsconfig.json                 # TypeScript compiler configuration
└── vite.config.ts                # Vite build config with relative base path support
```

---

## 💡 Guidelines for Further Development

### 1. Adding New Reframe Cards
To introduce new built-in reframes:
- Open `src/data/defaultCards.ts`.
- Add an object to `DEFAULT_CARDS` matching the `ReframeCard` interface:
  ```typescript
  {
    id: 'card-new-id',
    category: 'gratitude', // 'gratitude' | 'assertiveness' | 'diplomacy' | 'solutions' | 'praise'
    categoryLabel: 'Apologies to Gratitude',
    dangerPhrase: "Sorry to bother you with this.",
    powerPhrase: "Do you have 2 minutes for a quick alignment?",
    context: "Reaching out to a teammate for a quick decision.",
    psychologicalShift: "From Inconvenience to Respectful Request",
    rationale: "Avoids framing your presence as a burden while making a clear, respectful request.",
    deliveryTip: "Speak with warm, downward vocal inflection.",
    box: 1,
    intervalDays: 1,
    lastReviewedAt: null,
    nextDueAt: new Date().toISOString(),
    timesReviewed: 0,
    timesCorrect: 0,
    streak: 0,
  }
  ```

### 2. Tuning the Leitner Intervals
To alter repetition intervals or retention algorithms, adjust `LEITNER_INTERVALS` and the rating transitions in `src/utils/leitnerStorage.ts`:
- Current intervals: Box 1 = 1d, Box 2 = 2d, Box 3 = 4d, Box 4 = 7d, Box 5 = 14d.
- Custom intervals (e.g. Anki-style exponential multipliers) can be calibrated inside `rateCard()`.

### 3. Adding Scenario Quizzes
- In `src/data/defaultCards.ts`, append new scenarios to `SCENARIO_QUIZZES`.
- Each question must provide 1 optimal response (grounded in strategic reframing) and 2 common communication traps (over-apologetic or aggressive/defensive), along with pedagogical feedback explaining the psychological mechanism.

### 4. Visual Styling Discipline (Theme #12)
- Maintain the **Retro Terminal Console** visual design system:
  - Keep neutral CRT monitor darks (`#070b09`, `#0c1611`).
  - Reserve amber accents for danger triggers (`glow-amber`) and emerald accents for power phrases (`glow-emerald`).
  - Adhere to the **zero-pill rule**: Render metadata as clean, unboxed text separated by dots or brackets (`[BOX 2] · [4 DAYS]`), never wrapped in rounded pill badges.
  - Maintain the 3-zone contract in top navigation headers.

---

## ⚖️ License

Distributed under the Apache-2.0 License. See source headers for details.
