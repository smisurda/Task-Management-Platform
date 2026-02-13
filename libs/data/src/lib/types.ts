import { Role } from '@app/auth';

export { Role };

export enum TaskStatus {
  Todo = 'Todo',
  InProgress = 'InProgress',
  Done = 'Done',
}

export enum TaskCategory {
  Work = 'Work',
  Personal = 'Personal',
}

export interface User {
  id: string;
  email: string;
  organizationId: string;
  role: Role;
  createdAt: string;
}

export interface Organization {
  id: string;
  name: string;
  parentId: string | null;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  category: TaskCategory;
  orderIndex: number;
  organizationId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string | null;
  details: string | null;
  timestamp: string;
}
