
export interface Task {
  id: string;
  text: string;
  completed: boolean;
  estimatedMinutes: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  sources?: { uri: string; title: string }[];
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

export interface SummaryResult {
  title: string;
  content: string;
  keyPoints: string[];
}

export interface StudyStep {
  title: string;
  description: string;
  estimatedHours: number;
}

export interface StudyMap {
  goal: string;
  milestones: StudyStep[];
}

export interface StudySession {
  id: string;
  startTime: number;
  endTime?: number;
  durationMinutes: number;
  tasksCompleted: number;
  distractionCount: number;
  subject: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  unlocked: boolean;
}

export interface UserStats {
  totalPoints: number;
  streak: number;
  lastActiveDay?: string; // ISO date
  unlockedBadges: string[]; // Badge IDs
}

export type PomodoroPhase = 'work' | 'break';

export type AIPersona = 'Standard' | 'Socratic' | 'Strict Coach' | 'Supportive';

export enum AppMode {
  DASHBOARD = 'DASHBOARD',
  STUDYING = 'STUDYING',
  VOICE_LIVE = 'VOICE_LIVE'
}
