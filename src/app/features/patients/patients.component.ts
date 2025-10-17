import { Component, inject, signal, ChangeDetectionStrategy, computed } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { PatientApiService } from '../../core/services/PatientApi.service';
import { CommonModule } from '@angular/common';
import { Patient } from '../../shared/Models/patient.model';


@Component({
  selector: 'app-patients',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './patients.component.html',
  styleUrl: './patients.component.css',
  providers: [PatientApiService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatientsComponent {
  private patientService = inject(PatientApiService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  // Expose Math for template
  Math = Math;

  // State signals
  patients = signal<Patient[]>([]);
  isEditing = signal(false);
  submitted = signal(false);
  
  // Pagination signals
  currentPage = signal(1);
  pageSize = signal(10);
  totalCount = signal(0);
  totalPages = signal(0);
  hasPreviousPage = signal(false);
  hasNextPage = signal(false);

  patientForm = this.fb.group({
    id: [null as number | null],
    name: ['', Validators.required],
    phone: ['', Validators.required],
    age: [null as number | null, [Validators.required, Validators.min(0)]],
    address: ['', Validators.required],
  });

  constructor() {
    this.loadPatients();
  }

  loadPatients() {
    this.patientService.getPatients(this.currentPage(), this.pageSize()).pipe(
      tap(data => {
        this.patients.set(data.items);
        this.currentPage.set(data.pageNumber);
        this.pageSize.set(data.pageSize);
        this.totalCount.set(data.totalCount);
        this.totalPages.set(data.totalPages);
        this.hasPreviousPage.set(data.hasPreviousPage);
        this.hasNextPage.set(data.hasNextPage);
      })
    ).subscribe();
  }

  onSubmit() {
    this.submitted.set(true);
    if (this.patientForm.invalid) {
      return;
    }

    const formValue = this.patientForm.getRawValue();
    const patientData = {
        name: formValue.name!,
        phone: formValue.phone!,
        age: formValue.age!,
        address: formValue.address!,
    };

    if (this.isEditing() && formValue.id) {
       this.patientService.updatePatient(formValue.id, { ...patientData, id: formValue.id }).subscribe(() => {
        this.loadPatients();
        this.resetForm();
      });
    } else {
      this.patientService.createPatient(patientData).subscribe(() => {
        this.loadPatients();
        this.resetForm();
      });
    }
  }

  editPatient(patient: Patient) {
    this.isEditing.set(true);
    this.patientForm.patchValue(patient);
  }

  deletePatient(id: number) {
    if (confirm('Are you sure you want to delete this patient?')) {
      this.patientService.deletePatient(id).subscribe(() => {
        this.loadPatients();

      });
    }
  }
  
  resetForm() {
    this.patientForm.reset();
    this.isEditing.set(false);
    this.submitted.set(false);
  }

  onSearch(query: string) {
    if (query) {
      this.patientService.searchPatientsByPhone(query).subscribe({
        next: (data) => {
          // If a patient is found, set it as a single-item array, otherwise empty array
          this.patients.set(data ? [data] : []);
          // Reset pagination when searching
          this.totalCount.set(data ? 1 : 0);
          this.totalPages.set(1);
          this.currentPage.set(1);
          this.hasPreviousPage.set(false);
          this.hasNextPage.set(false);
        },
        error: (error) => {
          console.error('Search error:', error);
          this.patients.set([]);
          this.totalCount.set(0);
        }
      });
    } else {
      this.currentPage.set(1); // Reset to first page
      this.loadPatients(); // Load all patients if filter is cleared
    }
  }

  viewOperations(patientId: number, patientName: string) {
    this.router.navigate(['/operations', patientId,  patientName ]);
  }

  // Pagination methods
  goToFirstPage() {
    this.currentPage.set(1);
    this.loadPatients();
  }

  goToPreviousPage() {
    if (this.hasPreviousPage()) {
      this.currentPage.update(page => page - 1);
      this.loadPatients();
    }
  }

  goToNextPage() {
    if (this.hasNextPage()) {
      this.currentPage.update(page => page + 1);
      this.loadPatients();
    }
  }

  goToLastPage() {
    this.currentPage.set(this.totalPages());
    this.loadPatients();
  }

  onPageSizeChange(newPageSize: number) {
    this.pageSize.set(newPageSize);
    this.currentPage.set(1); // Reset to first page when changing page size
    this.loadPatients();
  }

}
