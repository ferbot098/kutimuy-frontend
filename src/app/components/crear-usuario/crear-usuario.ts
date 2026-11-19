import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Usuario as UsuarioModel } from '../../models/usuario';
import { UsuarioService } from '../../services/usuario';

@Component({
  selector: 'app-usuario',
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-usuario.html',
  styleUrl: './crear-usuario.css'
})
export class Usuario implements OnInit {

  usuarios: UsuarioModel[] = [];
  usuario: UsuarioModel = this.usuarioVacio();
  editando: boolean = false;
  cargando: boolean = false;
  mensaje: string = '';
  mensajeExito: string = '';

  constructor(private usuarioService: UsuarioService) {}

  ngOnInit(): void {
    this.listarUsuarios();
  }

  usuarioVacio(): UsuarioModel {
    return {
      nombre: '',
      email: '',
      password: '',
      rol: 'RECEPCION',
      activo: true
    };
  }

  listarUsuarios(): void {
    this.usuarioService.listarUsuarios().subscribe({
      next: (usuarios: UsuarioModel[]) => {
        this.usuarios = usuarios;
      },
      error: () => {
        this.mensaje = 'Error al cargar la lista de usuarios';
      }
    });
  }

  guardarUsuario(): void {

    this.mensaje = '';

    if (
      !this.usuario.nombre.trim() ||
      !this.usuario.email.trim() ||
      (!this.editando && !this.usuario.password.trim())
    ) {
      this.mensaje = 'Complete todos los campos obligatorios';
      return;
    }

    this.cargando = true;

    const accion = this.editando
      ? this.usuarioService.actualizarUsuario(this.usuario.idUsuario!, this.usuario)
      : this.usuarioService.crearUsuario(this.usuario);

    accion.subscribe({
      next: () => {
        this.cargando = false;

        this.mensajeExito = this.editando
          ? 'Usuario actualizado correctamente'
          : 'Usuario registrado correctamente';

        this.cancelarEdicion();
        this.listarUsuarios();

        setTimeout(() => {
          this.mensajeExito = '';
        }, 3000);
      },
      error: (error: any) => {
        this.cargando = false;

        if (error.status === 400 || error.status === 500) {
          this.mensaje = error.error?.mensaje || 'El email ya está registrado';
        } else {
          this.mensaje = 'Error al guardar el usuario';
        }
      }
    });
  }

  editarUsuario(usuario: UsuarioModel): void {

    this.editando = true;
    this.mensaje = '';

    this.usuario = {
      idUsuario: usuario.idUsuario,
      nombre: usuario.nombre,
      email: usuario.email,
      password: '',
      rol: usuario.rol,
      activo: usuario.activo
    };
  }

  eliminarUsuario(usuario: UsuarioModel): void {

    if (!confirm(`¿Eliminar al usuario "${usuario.nombre}"?`)) {
      return;
    }

    this.usuarioService.eliminarUsuario(usuario.idUsuario!).subscribe({
      next: () => {
        this.mensajeExito = 'Usuario eliminado correctamente';

        if (this.editando && this.usuario.idUsuario === usuario.idUsuario) {
          this.cancelarEdicion();
        }

        this.listarUsuarios();

        setTimeout(() => {
          this.mensajeExito = '';
        }, 3000);
      },
      error: () => {
        this.mensaje = 'Error al eliminar el usuario';
      }
    });
  }

  cancelarEdicion(): void {
    this.editando = false;
    this.usuario = this.usuarioVacio();
  }
}