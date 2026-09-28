import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Cabana } from '../models/cabana';

@Injectable({
  providedIn: 'root'
})
export class CabanaService {

  private apiUrl = 'https://kutimuy-bdp.onrender.com/api/cabanas';

  constructor(private http: HttpClient) {}

  listar(): Observable<Cabana[]> {
    return this.http.get<Cabana[]>(this.apiUrl);
  }

  crear(cabana: Cabana): Observable<Cabana> {
    return this.http.post<Cabana>(this.apiUrl, cabana);
  }

  actualizar(id: number, cabana: Cabana): Observable<Cabana> {
    return this.http.put<Cabana>(`${this.apiUrl}/${id}`, cabana);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}