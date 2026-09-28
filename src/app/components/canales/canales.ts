import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CanalOrigen } from '../../models/canal-origen';
import { CanalOrigenService } from '../../services/canal-origen';

@Component({
  selector: 'app-canales',
  imports: [CommonModule, FormsModule],
  templateUrl: './canales.html',
  styleUrl: './canales.css'
})
export class Canales implements OnInit {

  canales: CanalOrigen[] = [];
  canal: CanalOrigen = this.canalVacio();
  editando: boolean = false;
  cargando: boolean = false;
  mensaje: string = '';
  mensajeExito: string = '';

  constructor(private canalOrigenService: CanalOrigenService) {}

  ngOnInit(): void {
    this.listar();
  }

  canalVacio(): CanalOrigen {
    return {
      nombre: '',
      descripcion: '',
      activo: true
    };
  }

  listar(): void {
    this.canalOrigenService.listar().subscribe({
      next: (canales: CanalOrigen[]) => {
        this.canales = canales;
      },
      error: () => {
        this.mensaje = 'Error al cargar la lista de canales';
      }
    });
  }

  guardar(): void {

    this.mensaje = '';

    if (!this.canal.nombre.trim()) {
      this.mensaje = 'Complete los campos obligatorios';
      return;
    }

    this.cargando = true;

    const accion = this.editando
      ? this.canalOrigenService.actualizar(this.canal.idCanalOrigen!, this.canal)
      : this.canalOrigenService.crear(this.canal);

    accion.subscribe({
      next: () => {
        this.cargando = false;

        this.mensajeExito = this.editando
          ? 'Canal actualizado correctamente'
          : 'Canal registrado correctamente';

        this.cancelarEdicion();
        this.listar();

        setTimeout(() => {
          this.mensajeExito = '';
        }, 3000);
      },
      error: (error: any) => {
        this.cargando = false;

        if (error.status === 400 || error.status === 500) {
          this.mensaje = error.error?.mensaje || 'Error al guardar el canal';
        } else {
          this.mensaje = 'Error al guardar el canal';
        }
      }
    });
  }

  editar(canal: CanalOrigen): void {
    this.editando = true;
    this.mensaje = '';
    this.canal = { ...canal };
  }

  eliminar(canal: CanalOrigen): void {

    if (!confirm(`¿Eliminar el canal "${canal.nombre}"?`)) {
      return;
    }

    this.canalOrigenService.eliminar(canal.idCanalOrigen!).subscribe({
      next: () => {
        this.mensajeExito = 'Canal eliminado correctamente';

        if (this.editando && this.canal.idCanalOrigen === canal.idCanalOrigen) {
          this.cancelarEdicion();
        }

        this.listar();

        setTimeout(() => {
          this.mensajeExito = '';
        }, 3000);
      },
      error: () => {
        this.mensaje = 'Error al eliminar el canal';
      }
    });
  }

  cancelarEdicion(): void {
    this.editando = false;
    this.canal = this.canalVacio();
  }
}