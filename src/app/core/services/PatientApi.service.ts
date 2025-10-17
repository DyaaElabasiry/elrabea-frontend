import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Patient, PaginatedResponse } from '../../shared/Models/patient.model';


// --- API SERVICE ---
@Injectable({
  providedIn: 'root'
})
export class PatientApiService {
  private http = inject(HttpClient);
  // IMPORTANT: Replace with your actual API endpoint
  private apiUrl = 'https://elrabea.runasp.net/api/patients'; // Updated to your backend URL

  getPatients(pageNumber: number = 1, pageSize: number = 10): Observable<PaginatedResponse<Patient>> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());
    
    return this.http.get<PaginatedResponse<Patient>>(this.apiUrl, { params }).pipe(
      catchError(this.handleError<PaginatedResponse<Patient>>('getPatients', {
        items: [],
        pageNumber: 1,
        pageSize: 10,
        totalCount: 0,
        totalPages: 0,
        hasPreviousPage: false,
        hasNextPage: false
      }))
    );
  }

  getPatient(id: number): Observable<Patient | undefined> {
    
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<Patient>(url).pipe(catchError(this.handleError<Patient>(`getPatient id=${id}`)));
  }

  createPatient(patient: Omit<Patient, 'id'>): Observable<Patient> {
    
    return this.http.post<Patient>(this.apiUrl, patient).pipe(catchError(this.handleError<Patient>('createPatient')));
  }

  updatePatient(id: number, patient: Patient): Observable<any> {
    
    const url = `${this.apiUrl}/${id}`;
    return this.http.put(url, patient).pipe(catchError(this.handleError<any>('updatePatient')));
  }

  deletePatient(id: number): Observable<any> { // Changed return type to any as per backend NoContent
   
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<any>(url).pipe(catchError(this.handleError<any>('deletePatient')));
  }

  searchPatientsByPhone(phone: string): Observable<Patient | undefined> {
    const url = `${this.apiUrl}/search-by-phone?phone=${phone}`;
    return this.http.get<Patient>(url).pipe(catchError(this.handleError<Patient>('searchPatientsByPhone')));
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
}
