import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { TipoEvento } from '../models/tipo-evento';

@Injectable({
  providedIn: 'root'
})
export class TipoEventoService {

  private apiUrl = 'https://kutimuy-bdp.onrender.com/api/tipos-evento';

  constructor(private http: HttpClient) {}

  listar(): Observable<TipoEvento[]> {
    return this.http.get<TipoEvento[]>(this.apiUrl);
  }

  crear(tipoEvento: TipoEvento): Observable<TipoEvento> {
    return this.http.post<TipoEvento>(this.apiUrl, tipoEvento);
  }

  actualizar(id: number, tipoEvento: TipoEvento): Observable<TipoEvento> {
    return this.http.put<TipoEvento>(`${this.apiUrl}/${id}`, tipoEvento);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}