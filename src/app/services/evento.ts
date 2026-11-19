import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Evento } from '../models/evento';

@Injectable({
  providedIn: 'root'
})
export class EventoService {

  private apiUrl = 'https://kutimuy-bdp.onrender.com/api/eventos';

  constructor(private http: HttpClient) {}

  listar(): Observable<Evento[]> {
    return this.http.get<Evento[]>(this.apiUrl);
  }

  crear(evento: Evento): Observable<Evento> {
    return this.http.post<Evento>(this.apiUrl, evento);
  }

  actualizar(id: number, evento: Evento): Observable<Evento> {
    return this.http.put<Evento>(`${this.apiUrl}/${id}`, evento);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}