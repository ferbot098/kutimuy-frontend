import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Servicio } from '../../models/servicio';
import { ServicioService } from '../../services/servicio';

@Component({
  selector: 'app-servicios',
  imports: [CommonModule, FormsModule],
  templateUrl: './servicios.html',
  styleUrl: './servicios.css'
})
export class Servicios implements OnInit {

  servicios: Servicio[] = [];
  servicio: Servicio = this.servicioVacio();
  editando: boolean = false;
  cargando: boolean = false;
  mensaje: string = '';
  mensajeExito: string = '';

  constructor(private servicioService: ServicioService) {}

  ngOnInit(): void {
    this.listar();
  }

  servicioVacio(): Servicio {
    return {
      nombre: '',
      descripcion: '',
      precio: 0,
      activo: true
    };
  }

  listar(): void {
    this.servicioService.listar().subscribe({
      next: (servicios: Servicio[]) => {
        this.servicios = servicios;
      },
      error: () => {
        this.mensaje = 'Error al cargar la lista de servicios';
      }
    });
  }

  guardar(): void {

    this.mensaje = '';

    if (!this.servicio.nombre.trim() || this.servicio.precio < 0) {
      this.mensaje = 'Complete los campos obligatorios';
      return;
    }

    this.cargando = true;

    const accion = this.editando
      ? this.servicioService.actualizar(this.servicio.idServicio!, this.servicio)
      : this.servicioService.crear(this.servicio);

    accion.subscribe({
      next: () => {
        this.cargando = false;

        this.mensajeExito = this.editando
          ? 'Servicio actualizado correctamente'
          : 'Servicio registrado correctamente';

        this.cancelarEdicion();
        this.listar();

        setTimeout(() => {
          this.mensajeExito = '';
        }, 3000);
      },
      error: (error: any) => {
        this.cargando = false;

        if (error.status === 400 || error.status === 500) {
          this.mensaje = error.error?.mensaje || 'Error al guardar el servicio';
        } else {
          this.mensaje = 'Error al guardar el servicio';
        }
      }
    });
  }

  editar(servicio: Servicio): void {
    this.editando = true;
    this.mensaje = '';
    this.servicio = { ...servicio };
  }

  eliminar(servicio: Servicio): void {

    if (!confirm(`¿Eliminar el servicio "${servicio.nombre}"?`)) {
      return;
    }

    this.servicioService.eliminar(servicio.idServicio!).subscribe({
      next: () => {
        this.mensajeExito = 'Servicio eliminado correctamente';

        if (this.editando && this.servicio.idServicio === servicio.idServicio) {
          this.cancelarEdicion();
        }

        this.listar();

        setTimeout(() => {
          this.mensajeExito = '';
        }, 3000);
      },
      error: () => {
        this.mensaje = 'Error al eliminar el servicio';
      }
    });
  }

  cancelarEdicion(): void {
    this.editando = false;
    this.servicio = this.servicioVacio();
  }
}