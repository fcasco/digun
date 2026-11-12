import { ReframeCard, LeitnerRating, ReviewSessionStats } from '../types/reframe';
import { DEFAULT_CARDS } from '../data/defaultCards';

const STORAGE_KEY = 'articulation_leitner_cards_v1';
const STATS_KEY = 'articulation_global_stats_v1';

export interface GlobalStats {
  totalReviews: number;
  completedSessions: number;
  currentStreakDays: number;
  lastActiveDate: string;
}

// Leitner intervals in days per box
export const LEITNER_INTERVALS: Record<number, number> = {
  1: 1,
  2: 2,
  3: 4,
  4: 7,
  5: 14,
};

export const leitnerStorage = {
  loadCards(): ReframeCard[] {
    if (typeof window === 'undefined') return DEFAULT_CARDS;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        this.saveCards(DEFAULT_CARDS);
        return DEFAULT_CARDS;
      }
      const parsed = JSON.parse(raw) as ReframeCard[];
      if (!Array.isArray(parsed) || parsed.length === 0) {
        this.saveCards(DEFAULT_CARDS);
        return DEFAULT_CARDS;
      }
      return parsed;
    } catch {
      return DEFAULT_CARDS;
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
      return { totalReviews: 0, completedSessions: 0, currentStreakDays: 1, lastActiveDate: new Date().toISOString() };
    }
    try {
      const raw = localStorage.getItem(STATS_KEY);
      if (!raw) {
        const initial: GlobalStats = {
          totalReviews: 0,
          completedSessions: 0,
          currentStreakDays: 1,
          lastActiveDate: new Date().toISOString(),
        };
        this.saveStats(initial);
        return initial;
      }
      return JSON.parse(raw);
    } catch {
      return { totalReviews: 0, completedSessions: 0, currentStreakDays: 1, lastActiveDate: new Date().toISOString() };
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
    this.saveCards(DEFAULT_CARDS);
  },

  exportBackupJson(): string {
    const cards = this.loadCards();
    const stats = this.loadStats();
    return JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), cards, stats }, null, 2);
  },

  importBackupJson(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && Array.isArray(parsed.cards)) {
        this.saveCards(parsed.cards);
        if (parsed.stats) this.saveStats(parsed.stats);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
};
