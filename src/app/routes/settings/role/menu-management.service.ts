import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BackendMenu } from './role.model';
import { AuthService } from '@core/authentication/auth.service';

@Injectable({
  providedIn: 'root',
})
export class MenuManagementService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly baseUrl = '/api/menus';

  getMenusByCompany(): Observable<BackendMenu[]> {
    return this.http.get<BackendMenu[]>(`${this.baseUrl}/company/${this.authService.companyId}`);
  }

  createMenu(menu: BackendMenu): Observable<BackendMenu> {
    return this.http.post<BackendMenu>(`${this.baseUrl}/company/${this.authService.companyId}`, menu);
  }

  updateMenu(id: number, menu: BackendMenu): Observable<BackendMenu> {
    return this.http.put<BackendMenu>(`${this.baseUrl}/${id}`, menu);
  }

  deleteMenu(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  setMenuEnabled(id: number, enabled: boolean): Observable<BackendMenu> {
    return this.http.patch<BackendMenu>(`${this.baseUrl}/${id}/enabled?enabled=${enabled}`, {});
  }
}
