import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Department } from './department.model';

@Injectable({
  providedIn: 'root',
})
export class DepartmentService {
  constructor(private http: HttpClient) {}

  getDepartments(companyId: number) {
    return this.http.get<Department[]>(`api/departments/company/${companyId}`);
  }

  addDepartment(department: Partial<Department>) {
    return this.http.post<Department>('api/departments', department);
  }
}
