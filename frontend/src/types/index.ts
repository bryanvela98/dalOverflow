// src/types/index.ts

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  reputation: number;
  isProfessor?: boolean;
  isTA?: boolean;
  personalTags?: string[];
}

export interface Tag {
  id: string;
  name: string;
  description: string;
  totalQuestions: number;
  askedToday: number;
  askedThisWeek: number;
  isNew?: boolean;
  isPersonal?: boolean;
  createdAt: Date | string;
}

export interface Question {
  id: string;
  title: string;
  description: string;
  authorId: string;
  author?: User;
  isAnonymous: boolean;
  tags: Tag[];
  courseCode?: string;
  voteCount: number;
  viewCount: number;
  answerCount: number;
  commentCount: number;
  hasAcceptedAnswer: boolean;
  isAnswered: boolean;
  isBookmarked?: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Answer {
  id: string;
  questionId: string;
  body: string;
  authorId: string;
  author?: User;
  isAnonymous: boolean;
  voteCount: number;
  isAccepted: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Comment {
  id: string;
  parentId: string;
  parentType: 'question' | 'answer';
  body: string;
  authorId: string;
  author?: User;
  createdAt: Date | string;
}

export interface SimilarQuestion {
  id: string;
  title: string;
  similarity: number;
}

export interface CreateQuestionData {
  title: string;
  description: string;
  tags: string[];
  isAnonymous: boolean;
  courseCode?: string;
}

export type TagSortOption = 'popular' | 'name' | 'new';

export interface TagFilterParams {
  search?: string;
  sort?: TagSortOption;
  page?: number;
  limit?: number;
}

