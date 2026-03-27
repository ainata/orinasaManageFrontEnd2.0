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

  updateDepartment(id: number, department: Partial<Department>) {
    return this.http.put<Department>(`api/departments/${id}`, department);
  }

  deleteDepartment(id: number) {
    return this.http.delete(`api/departments/${id}`);
  }
}
