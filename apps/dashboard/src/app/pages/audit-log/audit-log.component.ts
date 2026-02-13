import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuditService } from '../../services/audit.service';
import type { AuditLogEntry } from '@app/data';

@Component({
  selector: 'app-audit-log',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50 p-4 md:p-8">
      <header class="flex items-center gap-4 mb-6">
        <a routerLink="/tasks" class="text-blue-600 hover:underline">← Tasks</a>
        <h1 class="text-2xl font-bold text-gray-800">Audit Log</h1>
      </header>
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-100">
            <tr>
              <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Time</th>
              <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">User</th>
              <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Action</th>
              <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Resource</th>
              <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Details</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            @for (entry of entries(); track entry.id) {
              <tr class="hover:bg-gray-50">
                <td class="px-4 py-2 text-sm text-gray-600">{{ entry.timestamp }}</td>
                <td class="px-4 py-2 text-sm">{{ entry.userId }}</td>
                <td class="px-4 py-2 text-sm">{{ entry.action }}</td>
                <td class="px-4 py-2 text-sm">{{ entry.resource }}{{ entry.resourceId ? ' ' + entry.resourceId : '' }}</td>
                <td class="px-4 py-2 text-sm text-gray-600 max-w-xs truncate">{{ entry.details }}</td>
              </tr>
            }
            @empty {
              <tr>
                <td colspan="5" class="px-4 py-8 text-center text-gray-500">No audit entries.</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class AuditLogComponent implements OnInit {
  private auditService = inject(AuditService);
  entries = signal<AuditLogEntry[]>([]);

  ngOnInit(): void {
    this.auditService.list(100).subscribe({
      next: (list) => this.entries.set(list),
      error: () => this.entries.set([]),
    });
  }
}
