export interface Hackathon {
  id: string;
  name: string;
  link: string;
  description: string;
  githubLink: string;
  deadline: string;
  startDate: string;
  endDate: string;
  teamName: string;
  memberIds: string[];
  resources: Resource[];
  tags: string[];
  priority: 'low' | 'medium' | 'high';
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Resource {
  id: string;
  name: string;
  url: string;
  type: 'link' | 'document' | 'design' | 'code' | 'submission' | 'other';
  addedAt: string;
}

export interface Member {
  id: string;
  name: string;
  telegramChatId: string;
  email: string;
  role: string;
}

export interface AppSettings {
  telegramBotToken: string;
  notifyDaysBefore: number;
}

export type HackathonStatus = 'upcoming' | 'ongoing' | 'completed';
export type ViewType = 'dashboard' | 'detail' | 'settings';
