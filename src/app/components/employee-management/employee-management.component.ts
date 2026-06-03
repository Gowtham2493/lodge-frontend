import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmployeeService } from '../../services/employee.service';
import { NotificationService } from '../../services/notification.service';

interface Employee {
  employeeId: number;
  username: string;
  role: string;
}

@Component({
  selector: 'app-employee-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <h4 class="fw-bold mb-3"><i class="bi bi-people me-2"></i>Employee Management</h4>

    <div class="form-section">
      <h5 class="mb-3 text-primary">{{ editingEmployee ? 'Edit Employee' : 'Add New Employee' }}</h5>
      <div class="row g-3" [formGroup]="employeeForm">
        <div class="col-md-3">
          <label class="form-label">Username *</label>
          <input type="text" class="form-control" formControlName="username" placeholder="Username">
        </div>
        <div class="col-md-3">
          <label class="form-label">Password {{ editingEmployee ? '(leave blank to keep)' : '*' }}</label>
          <input type="password" class="form-control" formControlName="password" placeholder="Password">
        </div>
        <div class="col-md-3">
          <label class="form-label">Role</label>
          <select class="form-select" formControlName="role">
            <option value="ADMIN">Admin</option>
            <option value="SUPERADMIN">Super Admin</option>
          </select>
        </div>
        <div class="col-md-3 d-flex align-items-end gap-2">
          <button type="button" class="btn btn-primary" (click)="onSave()" [disabled]="employeeForm.get('username')?.invalid">
            <i class="bi bi-check me-1"></i>{{ editingEmployee ? 'Update' : 'Add' }}
          </button>
          @if (editingEmployee) {
            <button type="button" class="btn btn-outline-secondary" (click)="cancelEdit()">Cancel</button>
          }
        </div>
      </div>
    </div>

    <div class="table-responsive bg-white shadow-sm rounded">
      <table class="table table-hover mb-0">
        <thead class="table-light">
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          @for (emp of employees; track emp.employeeId) {
            <tr>
              <td>{{ emp.employeeId }}</td>
              <td class="fw-bold">{{ emp.username }}</td>
              <td>
                <span class="badge" [class.bg-warning]="emp.role === 'SUPERADMIN'" [class.bg-info]="emp.role === 'ADMIN'">
                  {{ emp.role }}
                </span>
              </td>
              <td>
                <button class="btn btn-sm btn-outline-primary me-1" (click)="onEdit(emp)">
                  <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" (click)="onDelete(emp)" [disabled]="emp.role === 'SUPERADMIN'">
                  <i class="bi bi-trash"></i>
                </button>
              </td>
            </tr>
          } @empty {
            <tr>
              <td colspan="4" class="text-center text-muted py-4">No employees found</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `
})
export class EmployeeManagementComponent implements OnInit {
  employees: Employee[] = [];
  employeeForm: FormGroup;
  editingEmployee: Employee | null = null;

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private notificationService: NotificationService
  ) {
    this.employeeForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      role: ['ADMIN']
    });
  }

  ngOnInit(): void {
    this.loadEmployees();
  }

  onSave(): void {
    const data = {
      username: this.employeeForm.value.username,
      password: this.employeeForm.value.password,
      role: this.employeeForm.value.role
    };

    if (this.editingEmployee) {
      this.employeeService.updateEmployee(this.editingEmployee.employeeId, data).subscribe({
        next: () => {
          this.notificationService.success('Employee updated');
          this.cancelEdit();
          this.loadEmployees();
        },
        error: (err) => this.notificationService.error(err.error?.error || 'Failed to update employee')
      });
    } else {
      if (!data.password) {
        this.notificationService.error('Password is required for new employee');
        return;
      }
      this.employeeService.createEmployee(data).subscribe({
        next: () => {
          this.notificationService.success('Employee added');
          this.employeeForm.reset({ role: 'ADMIN' });
          this.loadEmployees();
        },
        error: (err) => this.notificationService.error(err.error?.error || 'Failed to add employee')
      });
    }
  }

  onEdit(emp: Employee): void {
    this.editingEmployee = emp;
    this.employeeForm.patchValue({ username: emp.username, password: '', role: emp.role });
    this.employeeForm.get('password')?.clearValidators();
    this.employeeForm.get('password')?.updateValueAndValidity();
  }

  onDelete(emp: Employee): void {
    if (confirm(`Delete employee "${emp.username}"?`)) {
      this.employeeService.deleteEmployee(emp.employeeId).subscribe({
        next: () => {
          this.notificationService.success('Employee deleted');
          this.loadEmployees();
        },
        error: (err) => this.notificationService.error(err.error?.error || 'Failed to delete employee')
      });
    }
  }

  cancelEdit(): void {
    this.editingEmployee = null;
    this.employeeForm.reset({ role: 'ADMIN' });
    this.employeeForm.get('password')?.setValidators(Validators.required);
    this.employeeForm.get('password')?.updateValueAndValidity();
  }

  private loadEmployees(): void {
    this.employeeService.getAllEmployees().subscribe({
      next: (employees) => this.employees = employees
    });
  }
}
