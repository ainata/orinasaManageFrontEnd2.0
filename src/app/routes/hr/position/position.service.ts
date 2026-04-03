import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Position } from './position.model';

@Injectable({
  providedIn: 'root',
})
export class PositionService {
  constructor(private http: HttpClient) {}

  getPositionsByActivity(activityId: number) {
    return this.http.get<Position[]>(`api/positions/activity/${activityId}`);
  }

  getPositionById(id: number) {
    return this.http.get<Position>(`api/positions/${id}`);
  }

  addPosition(position: Partial<Position>) {
    return this.http.post<Position>('api/positions', position);
  }

  updatePosition(id: number, position: Pick<Position, 'name' | 'code' | 'description'>) {
    return this.http.put<Position>(`api/positions/${id}`, position);
  }

  deletePosition(id: number) {
    return this.http.delete(`api/positions/${id}`);
  }
}
