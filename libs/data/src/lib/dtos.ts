import { TaskCategory, TaskStatus } from './types';

export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponseDto {
  access_token: string;
  user: {
    id: string;
    email: string;
    organizationId: string;
    role: string;
  };
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  status?: TaskStatus;
  category?: TaskCategory;
  orderIndex?: number;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  category?: TaskCategory;
  orderIndex?: number;
}

export interface TaskListQueryDto {
  status?: TaskStatus;
  category?: TaskCategory;
  sortBy?: 'createdAt' | 'updatedAt' | 'orderIndex' | 'title';
  sortOrder?: 'asc' | 'desc';
}
