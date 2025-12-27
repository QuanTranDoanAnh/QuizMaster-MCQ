export interface Option {
  id: string;
  label: string; // a, b, c, d
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  number: number;
  text: string;
  options: Option[];
}

export interface QuizSession {
  questions: Question[]; // The 40 (or less) questions for this session
  userAnswers: Record<string, string[]>; // questionId -> array of optionIds
  startTime: number;
  completed: boolean;
}

export interface QuizResult {
  date: string;
  totalQuestions: number;
  correctAnswers: number;
  scorePercentage: number;
  passed: boolean;
  timeSpent?: string;
}

export type AppView = 'upload' | 'quiz' | 'summary' | 'review';

export const PASSING_SCORE = 80;
export const QUESTIONS_PER_SESSION = 40;
export const TIME_LIMIT_MINUTES = 60;
export const TIME_LIMIT_SECONDS = TIME_LIMIT_MINUTES * 60;