import { Component, inject, signal, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { tap } from 'rxjs/operators';
import { Material } from '../../shared/Models/material.model';
import { MaterialApiService } from '../../core/services/MaterialApi.service';

@Component({
  selector: 'app-materials',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './materials.component.html',
  styleUrls: ['./materials.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MaterialsComponent {
  private materialService = inject(MaterialApiService);
  private fb = inject(FormBuilder);

  // State signals
  materials = signal<Material[]>([]);
  isEditing = signal(false);
  submitted = signal(false);
  startDate = signal<string>('');
  endDate = signal<string>('');

  // Computed signal for total price
  totalPrice = computed(() => this.materials().reduce((sum, material) => sum + material.price, 0));

  materialForm = this.fb.group({
    id: [null as number | null],
    materialName: ['', Validators.required],
    price: [null as number | null, [Validators.required, Validators.min(0)]],
    whoPaid: [''],
    date: ['', Validators.required],
  });

  constructor() {
    this.initializeDateRange();
    this.loadMaterials();
  }

  private initializeDateRange(): void {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    this.endDate.set(this.formatDate(today));
    this.startDate.set(this.formatDate(firstDayOfMonth));
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  loadMaterials(): void {
    this.materialService.getMaterialsByDateRange(this.startDate(), this.endDate()).pipe(
      tap(data => this.materials.set(data || []))
    ).subscribe();
  }

  onDateRangeChange(start: string, end: string): void {
    this.startDate.set(start);
    this.endDate.set(end);
    this.loadMaterials();
  }

  onSubmit(): void {
    this.submitted.set(true);
    if (this.materialForm.invalid) return;

    const formValue = this.materialForm.getRawValue();
    const materialData = {
      materialName: formValue.materialName!,
      price: formValue.price!,
      whoPaid: formValue.whoPaid!,
      date: formValue.date!,
    };

    const operation = this.isEditing() && formValue.id
      ? this.materialService.updateMaterial(formValue.id, { ...materialData, id: formValue.id })
      : this.materialService.createMaterial(materialData);

    operation.subscribe(() => {
      this.loadMaterials();
      this.resetForm();
    });
  }

  editMaterial(material: Material): void {
    this.isEditing.set(true);
    this.materialForm.patchValue({
        ...material,
        date: this.formatDate(new Date(material.date)) // Ensure date is in yyyy-MM-dd format for the input
    });
  }

  deleteMaterial(id: number): void {
    if (confirm('Are you sure you want to delete this material?')) {
      this.materialService.deleteMaterial(id).subscribe(() => {
        this.loadMaterials();
      });
    }
  }

  resetForm(): void {
    this.materialForm.reset();
    this.isEditing.set(false);
    this.submitted.set(false);
  }
}
