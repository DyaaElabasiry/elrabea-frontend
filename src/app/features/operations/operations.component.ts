import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Operation } from '../../shared/Models/operation.model';
import { OperationApiService } from '../../core/services/OperationApi.service';

@Component({
  selector: 'app-operations',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './operations.component.html',
  styleUrls: ['./operations.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OperationsComponent implements OnInit {
  private operationService = inject(OperationApiService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);

  // State signals
  operations = signal<Operation[]>([]);
  patientId = signal<number>(0);
  patientName = signal<string>('');
  isEditing = signal(false);
  submitted = signal(false);

  operationForm = this.fb.group({
    id: [null as number | null],
    operationName: ['', Validators.required],
    price: [null as number | null, [Validators.required, Validators.min(0)]],
    date: ['', Validators.required],
    notes: [''],
    patientId: [null as number | null, Validators.required],
  });

  ngOnInit(): void {
    // Get patientId from route params
    this.route.params.subscribe(params => {
      const id = +params['patientId'];
      const patientName = params['patientName'];
      if (id) {
        this.patientId.set(id);
        this.patientName.set(patientName);
        this.operationForm.patchValue({ patientId: id });
        this.loadOperations(id);
      }
    });
  }

  loadOperations(patientId: number): void {
    this.operationService.getOperationsByPatientId(patientId).pipe(
      tap(data => {
        this.operations.set(data || []);
        // Get patient name from first operation if available
        if (data && data.length > 0 && data[0].patient) {
          this.patientName.set(data[0].patient.name);
        }
      })
    ).subscribe();
  }

  onSubmit(): void {
    this.submitted.set(true);
    if (this.operationForm.invalid) return;

    const formValue = this.operationForm.getRawValue();
    const operationData = {
      operationName: formValue.operationName!,
      price: formValue.price!,
      date: formValue.date!,
      notes: formValue.notes || '',
      patientId: formValue.patientId!,
    };

    const operation = this.isEditing() && formValue.id
      ? this.operationService.updateOperation(formValue.id, { 
          ...operationData, 
          id: formValue.id,
          paid: 0,
          remainder: 0
        })
      : this.operationService.createOperation(operationData);

    operation.subscribe(() => {
      this.loadOperations(this.patientId());
      this.resetForm();
    });
  }

  editOperation(operation: Operation): void {
    this.isEditing.set(true);
    this.operationForm.patchValue({
      id: operation.id,
      operationName: operation.operationName,
      price: operation.price,
      date: this.formatDate(new Date(operation.date)),
      notes: operation.notes || '',
      patientId: operation.patientId
    });
  }

  deleteOperation(id: number): void {
    if (confirm('Are you sure you want to delete this operation?')) {
      this.operationService.deleteOperation(id).subscribe(() => {
        this.loadOperations(this.patientId());
      });
    }
  }

  resetForm(): void {
    this.operationForm.reset();
    this.operationForm.patchValue({ patientId: this.patientId() });
    this.isEditing.set(false);
    this.submitted.set(false);
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
