import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { LoginResponse, Usuario as UsuarioModel } from '../models/usuario';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private apiUrl = 'https://kutimuy-bdp.onrender.com/api/usuarios';

  constructor(private http: HttpClient) {}

  login(credenciales: { email: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credenciales);
  }

  listarUsuarios(): Observable<UsuarioModel[]> {
    return this.http.get<UsuarioModel[]>(this.apiUrl);
  }

  obtenerUsuario(id: number): Observable<UsuarioModel> {
    return this.http.get<UsuarioModel>(`${this.apiUrl}/${id}`);
  }

  crearUsuario(usuario: UsuarioModel): Observable<UsuarioModel> {
    return this.http.post<UsuarioModel>(this.apiUrl, usuario);
  }

  actualizarUsuario(id: number, usuario: UsuarioModel): Observable<UsuarioModel> {
    return this.http.put<UsuarioModel>(`${this.apiUrl}/${id}`, usuario);
  }

  eliminarUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
