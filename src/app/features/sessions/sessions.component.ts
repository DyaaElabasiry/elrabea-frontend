import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Session } from '../../shared/Models/session.model';
import { SessionApiService } from '../../core/services/SessionApi.service';

@Component({
  selector: 'app-sessions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sessions.component.html',
  styleUrls: ['./sessions.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SessionsComponent implements OnInit {
  private sessionService = inject(SessionApiService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);

  // State signals
  sessions = signal<Session[]>([]);
  operationId = signal<number>(0);
  patientName = signal<string>('');
  operationName = signal<string>('');
  isEditing = signal(false);
  submitted = signal(false);

  sessionForm = this.fb.group({
    id: [null as number | null],
    paidInThisSession: [null as number | null, [Validators.required, Validators.min(0)]],
    date: ['', Validators.required],
    notes: [''],
    operationId: [null as number | null, Validators.required],
  });

  ngOnInit(): void {
    // Get operationId and patientName from route params
    this.route.params.subscribe(params => {
      const id = +params['operationId'];
      const patientName = params['patientName'];
      const operationName = params['operationName'];
      if (id) {
        this.operationId.set(id);
        this.patientName.set(patientName || '');
        this.operationName.set(operationName || '');
        this.sessionForm.patchValue({ operationId: id });
        this.loadSessions(id);
      }
    });
  }

  loadSessions(operationId: number): void {
    this.sessionService.getSessionsByOperationId(operationId).pipe(
      tap(data => {
        this.sessions.set(data || []);
        // Get operation and patient info from first session if available
        if (data && data.length > 0 && data[0].operation) {
          this.operationName.set(data[0].operation.operationName);
          if (data[0].operation.patient) {
            this.patientName.set(data[0].operation.patient.name);
          }
        }
      })
    ).subscribe();
  }

  onSubmit(): void {
    this.submitted.set(true);
    if (this.sessionForm.invalid) return;

    const formValue = this.sessionForm.getRawValue();
    const sessionData = {
      paidInThisSession: formValue.paidInThisSession!,
      date: formValue.date!,
      notes: formValue.notes || '',
      operationId: formValue.operationId!,
    };

    if (this.isEditing() && formValue.id) {
      this.sessionService.updateSession(formValue.id, { 
        ...sessionData, 
        id: formValue.id
      }).subscribe(() => {
        this.loadSessions(this.operationId());
        this.resetForm();
      });
    } else {
      this.sessionService.createSession(sessionData).subscribe(() => {
        this.loadSessions(this.operationId());
        this.resetForm();
      });
    }
  }

  editSession(session: Session): void {
    this.isEditing.set(true);
    this.sessionForm.patchValue({
      id: session.id,
      paidInThisSession: session.paidInThisSession,
      date: this.formatDate(new Date(session.date)),
      notes: session.notes || '',
      operationId: session.operationId
    });
  }

  deleteSession(id: number): void {
    if (confirm('Are you sure you want to delete this session?')) {
      this.sessionService.deleteSession(id).subscribe(() => {
        this.loadSessions(this.operationId());
      });
    }
  }

  resetForm(): void {
    this.sessionForm.reset();
    this.sessionForm.patchValue({ operationId: this.operationId() });
    this.isEditing.set(false);
    this.submitted.set(false);
  }

  calculateTotalPaid(): number {
    return this.sessions().reduce((sum, session) => sum + session.paidInThisSession, 0);
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
