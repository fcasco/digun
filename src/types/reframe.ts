export type CategoryId = 'gratitude' | 'assertiveness' | 'diplomacy' | 'solutions' | 'praise';

export interface CategoryMeta {
  id: CategoryId;
  name: string;
  shortDesc: string;
  iconName: string;
  colorHex: string;
}

export type LeitnerRating = 'again' | 'hard' | 'good' | 'easy';

export interface ReframeCard {
  id: string;
  category: CategoryId;
  categoryLabel: string;
  dangerPhrase: string;       // e.g. "Sorry I'm late."
  powerPhrase: string;        // e.g. "Thank you for waiting for me."
  context: string;            // The situational trigger / trigger dialogue
  psychologicalShift: string; // The core shift (e.g. "From Apology to Gratitude")
  rationale: string;          // Psychological why based on Responsibility Exchange Theory
  deliveryTip: string;        // Vocal intonation, posture, & pacing advice
  
  // Leitner spaced repetition state
  box: number;                // 1 to 5
  intervalDays: number;       // Current interval in days
  lastReviewedAt: string | null;
  nextDueAt: string;          // ISO timestamp
  timesReviewed: number;
  timesCorrect: number;
  streak: number;
  isCustom?: boolean;
}

export interface ReviewSessionStats {
  cardsReviewed: number;
  againCount: number;
  hardCount: number;
  goodCount: number;
  easyCount: number;
  promotedToBox5: number;
  startTime: number;
}

export interface QuizQuestion {
  id: string;
  scenario: string;
  speakerContext: string;
  dangerPhrase: string;
  options: {
    text: string;
    isOptimal: boolean;
    feedback: string;
  }[];
  category: CategoryId;
  psychologicalPrinciple: string;
}

export interface UIThemeInfo {
  rank: number;
  name: string;
  description: string;
  keyCharacteristics: string[];
  isChosen: boolean;
}
