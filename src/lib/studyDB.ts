// IndexedDB for Study Analytics and Flashcards
const DB_NAME = 'StudyAI_DB';
const DB_VERSION = 1;

export interface StudySession {
  id: string;
  subject: string;
  topic: string;
  startTime: number;
  endTime: number;
  duration: number; // in minutes
  type: 'flashcards' | 'quiz' | 'practice' | 'study';
  performance?: number; // 0-100 score
}

export interface FlashcardDeck {
  id: string;
  subject: string;
  topic: string;
  createdAt: number;
  lastReviewed?: number;
  cards: FlashcardWithSRS[];
}

export interface FlashcardWithSRS {
  id: string;
  term: string;
  definition: string;
  pronunciation?: string;
  repetition: number;
  easeFactor: number;
  interval: number; // days
  dueDate: number; // timestamp
  correctCount: number;
  incorrectCount: number;
}

export interface QuizResult {
  id: string;
  subject: string;
  topic: string;
  timestamp: number;
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  weakQuestions: string[]; // question texts that were answered incorrectly
}

class StudyDatabase {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains('sessions')) {
          const sessionStore = db.createObjectStore('sessions', { keyPath: 'id' });
          sessionStore.createIndex('subject', 'subject', { unique: false });
          sessionStore.createIndex('timestamp', 'startTime', { unique: false });
        }

        if (!db.objectStoreNames.contains('flashcards')) {
          const flashcardStore = db.createObjectStore('flashcards', { keyPath: 'id' });
          flashcardStore.createIndex('subject', 'subject', { unique: false });
          flashcardStore.createIndex('lastReviewed', 'lastReviewed', { unique: false });
        }

        if (!db.objectStoreNames.contains('quizResults')) {
          const quizStore = db.createObjectStore('quizResults', { keyPath: 'id' });
          quizStore.createIndex('subject', 'subject', { unique: false });
          quizStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  // Study Sessions
  async addSession(session: StudySession): Promise<void> {
    const tx = this.db!.transaction('sessions', 'readwrite');
    tx.objectStore('sessions').add(session);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async getSessions(): Promise<StudySession[]> {
    const tx = this.db!.transaction('sessions', 'readonly');
    const store = tx.objectStore('sessions');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getSessionsBySubject(subject: string): Promise<StudySession[]> {
    const tx = this.db!.transaction('sessions', 'readonly');
    const index = tx.objectStore('sessions').index('subject');
    return new Promise((resolve, reject) => {
      const request = index.getAll(subject);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Flashcard Decks
  async saveDeck(deck: FlashcardDeck): Promise<void> {
    const tx = this.db!.transaction('flashcards', 'readwrite');
    tx.objectStore('flashcards').put(deck);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async getDeck(id: string): Promise<FlashcardDeck | undefined> {
    const tx = this.db!.transaction('flashcards', 'readonly');
    return new Promise((resolve, reject) => {
      const request = tx.objectStore('flashcards').get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllDecks(): Promise<FlashcardDeck[]> {
    const tx = this.db!.transaction('flashcards', 'readonly');
    return new Promise((resolve, reject) => {
      const request = tx.objectStore('flashcards').getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteDeck(id: string): Promise<void> {
    const tx = this.db!.transaction('flashcards', 'readwrite');
    tx.objectStore('flashcards').delete(id);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // Quiz Results
  async saveQuizResult(result: QuizResult): Promise<void> {
    const tx = this.db!.transaction('quizResults', 'readwrite');
    tx.objectStore('quizResults').add(result);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async getQuizResults(): Promise<QuizResult[]> {
    const tx = this.db!.transaction('quizResults', 'readonly');
    return new Promise((resolve, reject) => {
      const request = tx.objectStore('quizResults').getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getQuizResultsBySubject(subject: string): Promise<QuizResult[]> {
    const tx = this.db!.transaction('quizResults', 'readonly');
    const index = tx.objectStore('quizResults').index('subject');
    return new Promise((resolve, reject) => {
      const request = index.getAll(subject);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

// Spaced Repetition Algorithm (SM-2)
export class SRSAlgorithm {
  static calculateNextReview(
    card: FlashcardWithSRS,
    quality: number // 0-5 rating (0=complete blackout, 5=perfect)
  ): FlashcardWithSRS {
    let { repetition, easeFactor, interval } = card;

    if (quality >= 3) {
      // Correct response
      if (repetition === 0) {
        interval = 1;
      } else if (repetition === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor);
      }
      repetition += 1;
      card.correctCount += 1;
    } else {
      // Incorrect response
      repetition = 0;
      interval = 1;
      card.incorrectCount += 1;
    }

    easeFactor =
      easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

    if (easeFactor < 1.3) {
      easeFactor = 1.3;
    }

    const dueDate = Date.now() + interval * 24 * 60 * 60 * 1000;

    return {
      ...card,
      repetition,
      easeFactor,
      interval,
      dueDate,
    };
  }

  static getDueCards(deck: FlashcardDeck): FlashcardWithSRS[] {
    const now = Date.now();
    return deck.cards.filter((card) => card.dueDate <= now);
  }

  static getWeakCards(deck: FlashcardDeck): FlashcardWithSRS[] {
    return deck.cards
      .filter((card) => card.incorrectCount > card.correctCount)
      .sort((a, b) => b.incorrectCount - a.incorrectCount);
  }
}

export const studyDB = new StudyDatabase();
