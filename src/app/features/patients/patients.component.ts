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

  // State signals
  patients = signal<Patient[]>([]);
  isEditing = signal(false);
  submitted = signal(false);

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
    this.patientService.getPatients().pipe(
      tap(data => this.patients.set(data))
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
        },
        error: (error) => {
          console.error('Search error:', error);
          this.patients.set([]);
        }
      });
    } else {
      this.loadPatients(); // Load all patients if filter is cleared
    }
  }

  viewOperations(patientId: number, patientName: string) {
    this.router.navigate(['/operations', patientId,  patientName ]);
  }

}
