import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { LoginResponse } from '../../models/usuario';
import { UsuarioService } from '../../services/usuario';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  credenciales = {
    email: '',
    password: ''
  };

  mensaje: string = '';
  cargando: boolean = false;

  constructor(
    private usuarioService: UsuarioService,
    private router: Router
  ) {}

  iniciarSesion(): void {

    this.mensaje = '';

    if (
      !this.credenciales.email.trim() ||
      !this.credenciales.password.trim()
    ) {
      this.mensaje = 'Ingrese su email y contraseña';
      return;
    }

    this.cargando = true;

    this.usuarioService.login(this.credenciales).subscribe({
      next: (respuesta: LoginResponse) => {
        localStorage.setItem('token', respuesta.token);
        localStorage.setItem('usuario', JSON.stringify({
          idUsuario: respuesta.idUsuario,
          nombre: respuesta.nombre,
          email: respuesta.email,
          rol: respuesta.rol
        }));

        this.cargando = false;
        this.router.navigate([respuesta.rol === 'ADMINISTRADOR' ? '/usuarios' : '/inicio']);
      },
      error: (error: any) => {
        this.cargando = false;

        if (error.status === 401) {
          this.mensaje = 'Email o contraseña incorrectos';
        } else {
          this.mensaje = 'Error al iniciar sesión. Intente nuevamente';
        }
      }
    });
  }
}