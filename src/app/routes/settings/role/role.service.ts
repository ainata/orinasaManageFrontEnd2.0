import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Role, BackendMenu } from './role.model';
import { AuthService } from '@core/authentication/auth.service';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  private get baseUrl() {
    return `/api/companies/${this.authService.companyId}/roles`;
  }

  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(this.baseUrl);
  }

  getRoleById(id: number): Observable<Role> {
    return this.http.get<Role>(`${this.baseUrl}/${id}`);
  }

  createRole(role: Role): Observable<Role> {
    return this.http.post<Role>(this.baseUrl, role);
  }

  updateRole(id: number, role: Role): Observable<Role> {
    return this.http.put<Role>(`${this.baseUrl}/${id}`, role);
  }

  deleteRole(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  assignMenus(roleId: number, menuIds: number[]): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${roleId}/menus`, menuIds);
  }

  getMenusByRole(roleId: number): Observable<BackendMenu[]> {
    return this.http.get<BackendMenu[]>(`${this.baseUrl}/${roleId}/menus`);
  }
}
