import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import type { AuditLogEntry } from '@app/data';

@Injectable({ providedIn: 'root' })
export class AuditService {
  private base = `${environment.apiUrl}/audit-log`;

  constructor(private http: HttpClient) {}

  list(limit?: number): Observable<AuditLogEntry[]> {
    const params = limit != null ? { limit: limit.toString() } : {};
    return this.http.get<AuditLogEntry[]>(this.base, { params: params as any });
  }
}
