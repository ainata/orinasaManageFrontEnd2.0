import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Employee,
  PageResponse,
  SearchPayload,
  CreateUserRequest,
  UpdateUserRequest,
  UpdateUserStatusRequest,
  RoleDTO,
} from './employees.model';

@Injectable({
  providedIn: 'root',
})
export class EmployeesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/users';

  search(payload: SearchPayload): Observable<PageResponse<Employee>> {
    console.log('ici');
    
    return this.http.post<PageResponse<Employee>>(`${this.baseUrl}/paginate`, payload);
  }

  getById(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.baseUrl}/${id}`);
  }

  create(employee: CreateUserRequest): Observable<Employee> {
    return this.http.post<Employee>(this.baseUrl, employee);
  }

  update(id: number, employee: UpdateUserRequest): Observable<Employee> {
    return this.http.put<Employee>(`${this.baseUrl}/${id}`, employee);
  }

  updateStatus(id: number, status: boolean): Observable<void> {
    const payload: UpdateUserStatusRequest = { status };
    return this.http.put<void>(`${this.baseUrl}/${id}/status`, payload);
  }

  // Helper function to fetch roles for a company (from the user prompt)
  getRolesByCompany(companyId: number): Observable<RoleDTO[]> {
    return this.http.get<RoleDTO[]>(`/api/companies/${companyId}/roles`);
  }
}
