import { Route } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const appRoutes: Route[] = [
  { path: '', redirectTo: 'tasks', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent) },
  { path: 'tasks', loadComponent: () => import('./pages/tasks/task-list.component').then((m) => m.TaskListComponent), canActivate: [authGuard] },
  { path: 'audit-log', loadComponent: () => import('./pages/audit-log/audit-log.component').then((m) => m.AuditLogComponent), canActivate: [authGuard] },
  { path: '**', redirectTo: 'tasks' },
];
