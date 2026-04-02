import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Activity } from './activity.model';

@Injectable({
  providedIn: 'root',
})
export class ActivityService {
  constructor(private http: HttpClient) {}

  getActivitiesByDepartment(departmentId: number) {
    return this.http.get<Activity[]>(`api/activities/department/${departmentId}`);
  }

  getActivityById(id: number) {
    return this.http.get<Activity>(`api/activities/${id}`);
  }

  addActivity(activity: Partial<Activity>) {
    return this.http.post<Activity>('api/activities', activity);
  }

  // En update, l'API n'attend pas le departmentId (cf. payload Postman)
  updateActivity(id: number, activity: Pick<Activity, 'name' | 'code' | 'description'>) {
    return this.http.put<Activity>(`api/activities/${id}`, activity);
  }

  deleteActivity(id: number) {
    return this.http.delete(`api/activities/${id}`);
  }
}
