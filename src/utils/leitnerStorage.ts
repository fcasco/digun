import { ReframeCard, LeitnerRating, ReviewSessionStats } from '../types/reframe';
import { DEFAULT_CARDS } from '../data/defaultCards';

const STORAGE_KEY = 'articulation_leitner_cards_v1';
const STATS_KEY = 'articulation_global_stats_v1';
const FLASHCARD_PROGRESS_KEY = 'articulation_flashcard_progress_v1';
const QUIZ_PROGRESS_KEY = 'articulation_quiz_progress_v1';
const ACTIVE_TAB_KEY = 'articulation_active_tab_v1';

export type AppTab = 'flashcards' | 'quiz' | 'vault' | 'psychology';

export interface GlobalStats {
  totalReviews: number;
  completedSessions: number;
  currentStreakDays: number;
  lastActiveDate: string;
}

export interface FlashcardProgressState {
  filterCategory: string;
  studyMode: 'due' | 'all';
  speechRate: number;
  queueIds: string[];
  currentIndex: number;
  sessionStats: ReviewSessionStats;
  isSessionFinished: boolean;
  updatedAt: string;
}

export interface QuizProgressState {
  filterCategory: string;
  questionOrderIds: string[];
  currentQuestionIndex: number;
  selectedOptionIndex: number | null;
  hasSubmitted: boolean;
  score: number;
  isQuizCompleted: boolean;
  quizzesCompleted: number;
  bestScorePercentage: number;
  updatedAt: string;
}

// Leitner intervals in days per box
export const LEITNER_INTERVALS: Record<number, number> = {
  1: 1,
  2: 2,
  3: 4,
  4: 7,
  5: 14,
};

function cloneDefaultCards(): ReframeCard[] {
  return DEFAULT_CARDS.map(card => ({ ...card }));
}

function createInitialStats(): GlobalStats {
  return {
    totalReviews: 0,
    completedSessions: 0,
    currentStreakDays: 1,
    lastActiveDate: new Date().toISOString(),
  };
}

export const leitnerStorage = {
  loadCards(): ReframeCard[] {
    if (typeof window === 'undefined') return cloneDefaultCards();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const defaults = cloneDefaultCards();
        this.saveCards(defaults);
        return defaults;
      }
      const parsed = JSON.parse(raw) as ReframeCard[];
      if (!Array.isArray(parsed) || parsed.length === 0) {
        const defaults = cloneDefaultCards();
        this.saveCards(defaults);
        return defaults;
      }
      // Auto-merge any newly added default cards into the user's stored deck
      const existingIds = new Set(parsed.map(c => c.id));
      const missingDefaults = DEFAULT_CARDS.filter(c => !existingIds.has(c.id)).map(c => ({ ...c }));
      if (missingDefaults.length > 0) {
        const merged = [...parsed, ...missingDefaults];
        this.saveCards(merged);
        return merged;
      }
      return parsed;
    } catch {
      return cloneDefaultCards();
    }
  },

  saveCards(cards: ReframeCard[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
    } catch (e) {
      console.error('Failed to save cards to localStorage', e);
    }
  },

  loadStats(): GlobalStats {
    if (typeof window === 'undefined') {
      return createInitialStats();
    }
    try {
      const raw = localStorage.getItem(STATS_KEY);
      if (!raw) {
        const initial = createInitialStats();
        this.saveStats(initial);
        return initial;
      }
      return JSON.parse(raw);
    } catch {
      return createInitialStats();
    }
  },

  saveStats(stats: GlobalStats): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    } catch {
      // Ignored
    }
  },

  loadFlashcardProgress(): FlashcardProgressState | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(FLASHCARD_PROGRESS_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as FlashcardProgressState;
      if (!parsed || !Array.isArray(parsed.queueIds)) return null;
      return parsed;
    } catch {
      return null;
    }
  },

  saveFlashcardProgress(state: FlashcardProgressState): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(FLASHCARD_PROGRESS_KEY, JSON.stringify(state));
    } catch {
      // Ignored
    }
  },

  clearFlashcardProgress(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(FLASHCARD_PROGRESS_KEY);
    } catch {
      // Ignored
    }
  },

  loadQuizProgress(): QuizProgressState | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(QUIZ_PROGRESS_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as QuizProgressState;
      if (!parsed || !Array.isArray(parsed.questionOrderIds)) return null;
      return parsed;
    } catch {
      return null;
    }
  },

  saveQuizProgress(state: QuizProgressState): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(QUIZ_PROGRESS_KEY, JSON.stringify(state));
    } catch {
      // Ignored
    }
  },

  clearQuizProgress(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(QUIZ_PROGRESS_KEY);
    } catch {
      // Ignored
    }
  },

  loadActiveTab(): AppTab | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(ACTIVE_TAB_KEY);
      if (raw === 'flashcards' || raw === 'quiz' || raw === 'vault' || raw === 'psychology') {
        return raw;
      }
      return null;
    } catch {
      return null;
    }
  },

  saveActiveTab(tab: AppTab): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(ACTIVE_TAB_KEY, tab);
    } catch {
      // Ignored
    }
  },

  recordSessionComplete(sessionStats: ReviewSessionStats): void {
    const stats = this.loadStats();
    stats.totalReviews += sessionStats.cardsReviewed;
    stats.completedSessions += 1;

    const todayStr = new Date().toISOString().slice(0, 10);
    const lastStr = stats.lastActiveDate.slice(0, 10);

    if (todayStr !== lastStr) {
      const diffTime = Math.abs(new Date(todayStr).getTime() - new Date(lastStr).getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        stats.currentStreakDays += 1;
      } else if (diffDays > 1) {
        stats.currentStreakDays = 1;
      }
      stats.lastActiveDate = new Date().toISOString();
    }

    this.saveStats(stats);
  },

  /**
   * Applies Leitner spaced repetition rating algorithm to a card
   */
  rateCard(cardId: string, rating: LeitnerRating): { updatedCard: ReframeCard; promotedToBox5: boolean } {
    const cards = this.loadCards();
    const cardIndex = cards.findIndex(c => c.id === cardId);
    if (cardIndex === -1) {
      throw new Error(`Card with ID ${cardId} not found`);
    }

    const card = { ...cards[cardIndex] };
    const now = new Date();
    let newBox = card.box;
    let newInterval = card.intervalDays;
    let promotedToBox5 = false;

    switch (rating) {
      case 'again':
        // Card failed / memory slip: return to Box 1, reset streak
        newBox = 1;
        newInterval = 1;
        card.streak = 0;
        break;

      case 'hard':
        // Recall was difficult: keep current box, repeat soon
        newBox = card.box;
        newInterval = Math.max(1, Math.round(card.intervalDays * 0.8));
        card.timesCorrect += 1;
        break;

      case 'good':
        // Standard successful recall: promote to next Leitner Box
        if (card.box < 5) {
          newBox = card.box + 1;
          if (newBox === 5) promotedToBox5 = true;
        } else {
          newBox = 5;
        }
        newInterval = LEITNER_INTERVALS[newBox] || 14;
        card.timesCorrect += 1;
        card.streak += 1;
        break;

      case 'easy':
        // Effortless recall: fast-track forward 2 boxes
        newBox = Math.min(5, card.box + 2);
        if (newBox === 5 && card.box < 5) promotedToBox5 = true;
        newInterval = (LEITNER_INTERVALS[newBox] || 14) * 1.5;
        card.timesCorrect += 1;
        card.streak += 2;
        break;
    }

    const nextDueDate = new Date(now.getTime() + newInterval * 24 * 60 * 60 * 1000);

    card.box = newBox;
    card.intervalDays = newInterval;
    card.lastReviewedAt = now.toISOString();
    card.nextDueAt = nextDueDate.toISOString();
    card.timesReviewed += 1;

    cards[cardIndex] = card;
    this.saveCards(cards);

    return { updatedCard: card, promotedToBox5 };
  },

  getDueCards(): ReframeCard[] {
    const cards = this.loadCards();
    const now = new Date().getTime();
    return cards.filter(c => {
      // Due if never reviewed, or nextDueAt timestamp is past
      if (!c.lastReviewedAt || c.timesReviewed === 0) return true;
      return new Date(c.nextDueAt).getTime() <= now;
    });
  },

  getBoxDistribution(): Record<number, number> {
    const cards = this.loadCards();
    const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    cards.forEach(c => {
      const box = Math.min(5, Math.max(1, c.box || 1));
      dist[box] = (dist[box] || 0) + 1;
    });
    return dist;
  },

  addCard(newCard: Omit<ReframeCard, 'id' | 'box' | 'intervalDays' | 'lastReviewedAt' | 'nextDueAt' | 'timesReviewed' | 'timesCorrect' | 'streak' | 'isCustom'>): ReframeCard {
    const cards = this.loadCards();
    const card: ReframeCard = {
      ...newCard,
      id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      box: 1,
      intervalDays: 1,
      lastReviewedAt: null,
      nextDueAt: new Date().toISOString(),
      timesReviewed: 0,
      timesCorrect: 0,
      streak: 0,
      isCustom: true,
    };
    cards.unshift(card);
    this.saveCards(cards);
    return card;
  },

  deleteCard(cardId: string): void {
    const cards = this.loadCards();
    const filtered = cards.filter(c => c.id !== cardId);
    this.saveCards(filtered);
  },

  resetToDefault(): void {
    this.saveCards(cloneDefaultCards());
  },

  clearAllProgress(): { cards: ReframeCard[]; stats: GlobalStats } {
    const freshCards = cloneDefaultCards();
    const freshStats = createInitialStats();
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(STATS_KEY);
        localStorage.removeItem(FLASHCARD_PROGRESS_KEY);
        localStorage.removeItem(QUIZ_PROGRESS_KEY);
      } catch {
        // Ignored
      }
    }
    this.saveCards(freshCards);
    this.saveStats(freshStats);
    return { cards: freshCards, stats: freshStats };
  },

  exportBackupJson(): string {
    const cards = this.loadCards();
    const stats = this.loadStats();
    const flashcardProgress = this.loadFlashcardProgress();
    const quizProgress = this.loadQuizProgress();
    return JSON.stringify(
      {
        version: 2,
        exportedAt: new Date().toISOString(),
        cards,
        stats,
        flashcardProgress,
        quizProgress,
      },
      null,
      2
    );
  },

  importBackupJson(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && Array.isArray(parsed.cards)) {
        this.saveCards(parsed.cards);
        if (parsed.stats) this.saveStats(parsed.stats);
        if (parsed.flashcardProgress) this.saveFlashcardProgress(parsed.flashcardProgress);
        if (parsed.quizProgress) this.saveQuizProgress(parsed.quizProgress);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
};
