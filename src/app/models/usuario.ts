export interface Usuario {
  idUsuario?: number;
  nombre: string;
  email: string;
  password: string;
  rol: string;
  activo: boolean;
}

export interface LoginResponse {
  token: string;
  idUsuario: number;
  nombre: string;
  email: string;
  rol: string;
}
