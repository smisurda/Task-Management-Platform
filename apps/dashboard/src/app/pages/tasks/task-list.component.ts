import {
  Component,
  OnInit,
  signal,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { TaskService } from '../../services/task.service';
import { AuthService } from '../../core/auth.service';
import type { Task, TaskStatus, TaskCategory } from '@app/data';
import { TaskStatus as TaskStatusEnum, TaskCategory as TaskCategoryEnum } from '@app/data';
import { hasPermission, PERMISSIONS, AUDIT_READ_ROLES } from '@app/auth';
import { Role } from '@app/data';
import { ThemeService } from '../../theme.service';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DragDropModule],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8 transition-colors duration-300">
      <header class="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100">Tasks</h1>
        <div class="flex items-center gap-4">
          @if (canViewAudit()) {
            <a routerLink="/audit-log" class="text-sm text-blue-600 hover:underline">Audit log</a>
          }
          <span class="text-sm text-gray-600 dark:text-gray-300">{{ currentUser()?.email }} ({{ currentUser()?.role }})</span>
          <button
            (click)="auth.logout()"
            class="text-sm text-blue-600 hover:underline"
          >
            Log out
          </button>

          <!-- Dark/Light toggle -->
          <button
            (click)="theme.toggle()"
            class="ml-2 px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-300"
            [attr.aria-label]="'Toggle dark mode'"
          >
            <span *ngIf="theme.isDark(); else lightMode">🌙</span>
            <ng-template #lightMode>☀️</ng-template>
          </button>
        </div>
      </header>

      <!-- Filters -->
      <div class="flex flex-wrap gap-4 mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow transition-colors duration-300">
        <select
          [(ngModel)]="filterStatus"
          (ngModelChange)="loadTasks()"
          class="rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
        >
          <option value="">All statuses</option>
          <option value="Todo">Todo</option>
          <option value="InProgress">In Progress</option>
          <option value="Done">Done</option>
        </select>
        <select
          [(ngModel)]="filterCategory"
          (ngModelChange)="loadTasks()"
          class="rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
        >
          <option value="">All categories</option>
          <option value="Work">Work</option>
          <option value="Personal">Personal</option>
        </select>
        <select
          [(ngModel)]="sortBy"
          (ngModelChange)="loadTasks()"
          class="rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
        >
          <option value="orderIndex">Order</option>
          <option value="createdAt">Created</option>
          <option value="updatedAt">Updated</option>
          <option value="title">Title</option>
        </select>
        <select
          [(ngModel)]="sortOrder"
          (ngModelChange)="loadTasks()"
          class="rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
        @if (canCreate()) {
          <button
            (click)="openCreateModal()"
            class="ml-auto bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            New task
          </button>
        }
      </div>

      <!-- Task list (drag and drop) -->
      <div
        cdkDropList
        (cdkDropListDropped)="onDrop($event)"
        class="space-y-3"
      >
        @for (task of tasks(); track task.id) {
          <div
            cdkDrag
            class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-start justify-between gap-4 cursor-move hover:shadow-md transition-colors duration-300"
          >
            <div class="flex-1 min-w-0">
              <h3 class="font-medium text-gray-800 dark:text-gray-100">{{ task.title }}</h3>
              @if (task.description) {
                <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">{{ task.description }}</p>
              }
              <div class="flex flex-wrap gap-2 mt-2">
                <span class="text-xs px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700">{{ task.status }}</span>
                <span class="text-xs px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900">{{ task.category }}</span>
              </div>
            </div>
            <div class="flex gap-2 shrink-0">
              @if (canEdit()) {
                <button
                  (click)="openEditModal(task)"
                  class="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                >
                  Edit
                </button>
                <button
                  (click)="deleteTask(task)"
                  class="text-red-600 dark:text-red-400 hover:underline text-sm"
                >
                  Delete
                </button>
              }
            </div>
          </div>
        }
        @empty {
          <p class="text-gray-500 dark:text-gray-300 text-center py-8">No tasks yet.</p>
        }
      </div>

      <!-- Create/Edit modal -->
      @if (showModal()) {
        <div
          class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-10"
          (click)="closeModal()"
        >
          <div
            class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 transition-colors duration-300"
            (click)="$event.stopPropagation()"
          >
            <h2 class="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">{{ editingTask() ? 'Edit task' : 'New task' }}</h2>
            <form (ngSubmit)="saveTask()" class="space-y-4">
              <div>
                <label class="block text-sm font-medium mb-1 text-gray-800 dark:text-gray-100">Title</label>
                <input
                  [(ngModel)]="modalTitle"
                  name="title"
                  type="text"
                  class="w-full rounded border px-3 py-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                  required
                />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1 text-gray-800 dark:text-gray-100">Description</label>
                <textarea
                  [(ngModel)]="modalDescription"
                  name="description"
                  rows="3"
                  class="w-full rounded border px-3 py-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                ></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium mb-1 text-gray-800 dark:text-gray-100">Status</label>
                <select [(ngModel)]="modalStatus" name="status" class="w-full rounded border px-3 py-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100">
                  <option value="Todo">Todo</option>
                  <option value="InProgress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium mb-1 text-gray-800 dark:text-gray-100">Category</label>
                <select [(ngModel)]="modalCategory" name="category" class="w-full rounded border px-3 py-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100">
                  <option value="Work">Work</option>
                  <option value="Personal">Personal</option>
                </select>
              </div>
              <div class="flex justify-end gap-2 pt-4">
                <button type="button" (click)="closeModal()" class="px-4 py-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300">
                  Cancel
                </button>
                <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
})
export class TaskListComponent implements OnInit {
  private taskService = inject(TaskService);
  auth = inject(AuthService);
  theme = inject(ThemeService);

  tasks = signal<Task[]>([]);
  currentUser = this.auth.currentUser;
  filterStatus = '';
  filterCategory = '';
  sortBy: 'createdAt' | 'updatedAt' | 'orderIndex' | 'title' = 'orderIndex';
  sortOrder: 'asc' | 'desc' = 'asc';

  showModal = signal(false);
  editingTask = signal<Task | null>(null);
  modalTitle = '';
  modalDescription = '';
  modalStatus: TaskStatus = TaskStatusEnum.Todo;
  modalCategory: TaskCategory = TaskCategoryEnum.Work;

  canCreate = () => {
    const u = this.currentUser();
    return u && hasPermission(u.role as Role, PERMISSIONS.TASK_CREATE);
  };
  canEdit = () => {
    const u = this.currentUser();
    return u && hasPermission(u.role as Role, PERMISSIONS.TASK_UPDATE);
  };
  canViewAudit = () => {
    const u = this.currentUser();
    return u && AUDIT_READ_ROLES.includes(u.role as Role);
  };

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    const query: Record<string, string> = { sortBy: this.sortBy, sortOrder: this.sortOrder };
    if (this.filterStatus) query['status'] = this.filterStatus;
    if (this.filterCategory) query['category'] = this.filterCategory;
    this.taskService.list(query as any).subscribe({
      next: (list) => this.tasks.set(list),
      error: () => this.tasks.set([]),
    });
  }

  onDrop(event: CdkDragDrop<Task[]>): void {
    const list = [...this.tasks()];
    moveItemInArray(list, event.previousIndex, event.currentIndex);
    this.tasks.set(list);
    if (!this.canEdit()) return;
    list.forEach((t, i) => {
      if (t.orderIndex === i) return;
      this.taskService.update(t.id, { orderIndex: i }).subscribe({
        next: () => this.loadTasks(),
      });
    });
  }

  openCreateModal(): void {
    this.editingTask.set(null);
    this.modalTitle = '';
    this.modalDescription = '';
    this.modalStatus = TaskStatusEnum.Todo;
    this.modalCategory = TaskCategoryEnum.Work;
    this.showModal.set(true);
  }

  openEditModal(task: Task): void {
    this.editingTask.set(task);
    this.modalTitle = task.title;
    this.modalDescription = task.description;
    this.modalStatus = task.status;
    this.modalCategory = task.category;
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  saveTask(): void {
    const edit = this.editingTask();
    if (edit) {
      this.taskService
        .update(edit.id, {
          title: this.modalTitle,
          description: this.modalDescription,
          status: this.modalStatus,
          category: this.modalCategory,
        })
        .subscribe({
          next: () => {
            this.closeModal();
            this.loadTasks();
          },
        });
    } else {
      this.taskService
        .create({
          title: this.modalTitle,
          description: this.modalDescription,
          status: this.modalStatus,
          category: this.modalCategory,
        })
        .subscribe({
          next: () => {
            this.closeModal();
            this.loadTasks();
          },
        });
    }
  }

  deleteTask(task: Task): void {
    if (!confirm('Delete this task?')) return;
    this.taskService.delete(task.id).subscribe({
      next: () => this.loadTasks(),
    });
  }
}
