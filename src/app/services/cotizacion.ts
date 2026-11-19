import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Cotizacion } from '../models/cotizacion';

@Injectable({
  providedIn: 'root'
})
export class CotizacionService {

  private apiUrl = 'https://kutimuy-bdp.onrender.com/api/cotizaciones';

  constructor(private http: HttpClient) {}

  listar(): Observable<Cotizacion[]> {
    return this.http.get<Cotizacion[]>(this.apiUrl);
  }

  crear(cotizacion: Cotizacion): Observable<Cotizacion> {
    return this.http.post<Cotizacion>(this.apiUrl, cotizacion);
  }

  actualizar(id: number, cotizacion: Cotizacion): Observable<Cotizacion> {
    return this.http.put<Cotizacion>(`${this.apiUrl}/${id}`, cotizacion);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}