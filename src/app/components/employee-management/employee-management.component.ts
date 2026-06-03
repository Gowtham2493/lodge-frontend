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
  templateUrl: './employee-management.component.html',
  styleUrl: './employee-management.component.scss'
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
