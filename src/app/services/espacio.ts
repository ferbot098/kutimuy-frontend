import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Espacio } from '../models/espacio';

@Injectable({
  providedIn: 'root'
})
export class EspacioService {

  private apiUrl = 'https://kutimuy-bdp.onrender.com/api/espacios';

  constructor(private http: HttpClient) {}

  listar(): Observable<Espacio[]> {
    return this.http.get<Espacio[]>(this.apiUrl);
  }

  crear(espacio: Espacio): Observable<Espacio> {
    return this.http.post<Espacio>(this.apiUrl, espacio);
  }

  actualizar(id: number, espacio: Espacio): Observable<Espacio> {
    return this.http.put<Espacio>(`${this.apiUrl}/${id}`, espacio);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}