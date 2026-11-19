import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { CanalOrigen } from '../models/canal-origen';

@Injectable({
  providedIn: 'root'
})
export class CanalOrigenService {

  private apiUrl = 'https://kutimuy-bdp.onrender.com/api/canales-origen';

  constructor(private http: HttpClient) {}

  listar(): Observable<CanalOrigen[]> {
    return this.http.get<CanalOrigen[]>(this.apiUrl);
  }

  crear(canalOrigen: CanalOrigen): Observable<CanalOrigen> {
    return this.http.post<CanalOrigen>(this.apiUrl, canalOrigen);
  }

  actualizar(id: number, canalOrigen: CanalOrigen): Observable<CanalOrigen> {
    return this.http.put<CanalOrigen>(`${this.apiUrl}/${id}`, canalOrigen);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}