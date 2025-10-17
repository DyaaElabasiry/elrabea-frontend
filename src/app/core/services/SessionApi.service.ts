import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Session } from '../../shared/Models/session.model';

@Injectable({
  providedIn: 'root'
})
export class SessionApiService {
  private apiUrl = 'https://elrabea.runasp.net/api/sessions';

  constructor(private http: HttpClient) {}

  // Get all sessions
  getSessions(): Observable<Session[]> {
    return this.http.get<Session[]>(this.apiUrl);
  }

  // Get session by id
  getSession(id: number): Observable<Session> {
    return this.http.get<Session>(`${this.apiUrl}/${id}`);
  }

  // Get sessions by operation id
  getSessionsByOperationId(operationId: number): Observable<Session[]> {
    return this.http.get<Session[]>(`${this.apiUrl}/by-operation/${operationId}`);
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
