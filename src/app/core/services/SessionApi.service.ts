import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Session } from '../../shared/Models/session.model';

@Injectable({
  providedIn: 'root'
})
export class SessionApiService {
  private apiUrl = 'https://elrabea.runasp.net/api/sessions';

  constructor(private http: HttpClient) {}

  // Get all sessions
  getSessions(): Observable<Session[]> {
    return this.http.get<Session[]>(this.apiUrl).pipe(
      map(sessions => sessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
    );
  }

  // Get session by id
  getSession(id: number): Observable<Session> {
    return this.http.get<Session>(`${this.apiUrl}/${id}`);
  }

  // Get sessions by operation id
  getSessionsByOperationId(operationId: number): Observable<Session[]> {
    return this.http.get<Session[]>(`${this.apiUrl}/by-operation/${operationId}`).pipe(
      map(sessions => sessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
    );
  }

  // Create a new session
  createSession(session: Omit<Session, 'id'>): Observable<Session> {
    return this.http.post<Session>(this.apiUrl, session);
  }

  // Update an existing session
  updateSession(id: number, session: Session): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, session);
  }

  // Delete a session
  deleteSession(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
