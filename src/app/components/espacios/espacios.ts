import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Espacio } from '../../models/espacio';
import { EspacioService } from '../../services/espacio';

@Component({
  selector: 'app-espacios',
  imports: [CommonModule, FormsModule],
  templateUrl: './espacios.html',
  styleUrl: './espacios.css'
})
export class Espacios implements OnInit {

  espacios: Espacio[] = [];
  espacio: Espacio = this.espacioVacio();
  editando: boolean = false;
  cargando: boolean = false;
  mensaje: string = '';
  mensajeExito: string = '';

  estados = ['DISPONIBLE', 'RESERVADO', 'OCUPADO', 'MANTENIMIENTO'];

  constructor(private espacioService: EspacioService) {}

  ngOnInit(): void {
    this.listar();
  }

  espacioVacio(): Espacio {
    return {
      nombre: '',
      capacidad: 10,
      tarifa: 0,
      estado: 'DISPONIBLE'
    };
  }

  listar(): void {
    this.espacioService.listar().subscribe({
      next: (espacios: Espacio[]) => {
        this.espacios = espacios;
      },
      error: () => {
        this.mensaje = 'Error al cargar la lista de espacios';
      }
    });
  }

  guardar(): void {

    this.mensaje = '';

    if (!this.espacio.nombre.trim() || !this.espacio.capacidad || this.espacio.tarifa < 0) {
      this.mensaje = 'Complete los campos obligatorios';
      return;
    }

    this.cargando = true;

    const accion = this.editando
      ? this.espacioService.actualizar(this.espacio.idEspacio!, this.espacio)
      : this.espacioService.crear(this.espacio);

    accion.subscribe({
      next: () => {
        this.cargando = false;

        this.mensajeExito = this.editando
          ? 'Espacio actualizado correctamente'
          : 'Espacio registrado correctamente';

        this.cancelarEdicion();
        this.listar();

        setTimeout(() => {
          this.mensajeExito = '';
        }, 3000);
      },
      error: (error: any) => {
        this.cargando = false;

        if (error.status === 400 || error.status === 500) {
          this.mensaje = error.error?.mensaje || 'Error al guardar el espacio';
        } else {
          this.mensaje = 'Error al guardar el espacio';
        }
      }
    });
  }

  editar(espacio: Espacio): void {
    this.editando = true;
    this.mensaje = '';
    this.espacio = { ...espacio };
  }

  eliminar(espacio: Espacio): void {

    if (!confirm(`¿Eliminar el espacio "${espacio.nombre}"?`)) {
      return;
    }

    this.espacioService.eliminar(espacio.idEspacio!).subscribe({
      next: () => {
        this.mensajeExito = 'Espacio eliminado correctamente';

        if (this.editando && this.espacio.idEspacio === espacio.idEspacio) {
          this.cancelarEdicion();
        }

        this.listar();

        setTimeout(() => {
          this.mensajeExito = '';
        }, 3000);
      },
      error: () => {
        this.mensaje = 'Error al eliminar el espacio';
      }
    });
  }

  cancelarEdicion(): void {
    this.editando = false;
    this.espacio = this.espacioVacio();
  }
}