import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import type {
  Task,
  CreateTaskDto,
  UpdateTaskDto,
  TaskListQueryDto,
} from '@app/data';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private base = `${environment.apiUrl}/tasks`;

  constructor(private http: HttpClient) {}

  list(query?: TaskListQueryDto): Observable<Task[]> {
    let params = new HttpParams();
    if (query) {
      if (query.status) params = params.set('status', query.status);
      if (query.category) params = params.set('category', query.category);
      if (query.sortBy) params = params.set('sortBy', query.sortBy);
      if (query.sortOrder) params = params.set('sortOrder', query.sortOrder);
    }
    return this.http.get<Task[]>(this.base, { params });
  }

  get(id: string): Observable<Task> {
    return this.http.get<Task>(`${this.base}/${id}`);
  }

  create(dto: CreateTaskDto): Observable<Task> {
    return this.http.post<Task>(this.base, dto);
  }

  update(id: string, dto: UpdateTaskDto): Observable<Task> {
    return this.http.put<Task>(`${this.base}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
