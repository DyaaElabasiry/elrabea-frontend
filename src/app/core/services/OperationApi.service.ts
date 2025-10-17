import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Operation } from '../../shared/Models/operation.model';

@Injectable({
  providedIn: 'root'
})
export class OperationApiService {
  private http = inject(HttpClient);
  private apiUrl = 'https://elrabea.runasp.net/api/operations';

  getOperations(): Observable<Operation[]> {
    return this.http.get<Operation[]>(this.apiUrl).pipe(
      map(operations => operations.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())),
      catchError(this.handleError<Operation[]>('getOperations', []))
    );
  }

  getOperation(id: number): Observable<Operation | undefined> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<Operation>(url).pipe(
      catchError(this.handleError<Operation>(`getOperation id=${id}`))
    );
  }

  getOperationsByPatientId(patientId: number): Observable<Operation[]> {
    const url = `${this.apiUrl}/by-patient/${patientId}`;
    return this.http.get<Operation[]>(url).pipe(
      map(operations => operations.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())),
      catchError(this.handleError<Operation[]>('getOperationsByPatientId', []))
    );
  }

  createOperation(operation: Omit<Operation, 'id' | 'paid' | 'remainder'>): Observable<Operation> {
    return this.http.post<Operation>(this.apiUrl, operation).pipe(
      catchError(this.handleError<Operation>('createOperation'))
    );
  }

  updateOperation(id: number, operation: Operation): Observable<any> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.put(url, operation).pipe(
      catchError(this.handleError<any>('updateOperation'))
    );
  }

  deleteOperation(id: number): Observable<any> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<any>(url).pipe(
      catchError(this.handleError<any>('deleteOperation'))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}
