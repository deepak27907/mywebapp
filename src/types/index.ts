export interface User {
  id: string;
  name: string;
  email: string;
  studentId?: string;
  dateOfBirth?: string;
  institute?: string;
  department?: string;
  year?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  dueDate?: Date;
  userId?: string;
}

export interface MoodEntry {
  id: string;
  mood: string;
  energy: number;
  stress: number;
  focus: number;
  date: Date;
  notes?: string;
  userId?: string;
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: Date;
  aiFeedback?: string;
  userId?: string;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  userId?: string;
}