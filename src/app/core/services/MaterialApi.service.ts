import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Material } from '../../shared/Models/material.model';

@Injectable({
  providedIn: 'root'
})
export class MaterialApiService {
  private http = inject(HttpClient);
  private apiUrl = 'https://elrabea.runasp.net/api/materials'; // Using a relative URL

  getMaterialsByDateRange(startDate: string, endDate: string): Observable<Material[]> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);

    return this.http.get<Material[]>(`${this.apiUrl}/by-date-range`, { params }).pipe(
      catchError(this.handleError<Material[]>('getMaterialsByDateRange', []))
    );
  }

  createMaterial(material: Omit<Material, 'id'>): Observable<Material> {
    return this.http.post<Material>(this.apiUrl, material).pipe(
      catchError(this.handleError<Material>('createMaterial'))
    );
  }

  updateMaterial(id: number, material: Material): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, material).pipe(
      catchError(this.handleError<any>('updateMaterial'))
    );
  }

  deleteMaterial(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError<any>('deleteMaterial'))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      // If the API returns a 404, it often means "no results found", which isn't a critical error.
      if (error.status === 404 && operation === 'getMaterialsByDateRange') {
        return of(result as T); // Return an empty array
      }
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}