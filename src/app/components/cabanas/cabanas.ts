import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Cabana } from '../../models/cabana';
import { CabanaService } from '../../services/cabana';

@Component({
  selector: 'app-cabanas',
  imports: [CommonModule, FormsModule],
  templateUrl: './cabanas.html',
  styleUrl: './cabanas.css'
})
export class Cabanas implements OnInit {

  cabanas: Cabana[] = [];
  cabana: Cabana = this.cabanaVacia();
  editando: boolean = false;
  cargando: boolean = false;
  mensaje: string = '';
  mensajeExito: string = '';

  tipos = ['ESTANDAR', 'FAMILIAR', 'SUITE', 'DELUXE'];
  estados = ['DISPONIBLE', 'RESERVADA', 'OCUPADA', 'MANTENIMIENTO'];

  constructor(private cabanaService: CabanaService) {}

  ngOnInit(): void {
    this.listar();
  }

  cabanaVacia(): Cabana {
    return {
      numero: '',
      tipo: 'ESTANDAR',
      capacidad: 2,
      tarifaNoche: 0,
      estado: 'DISPONIBLE'
    };
  }

  listar(): void {
    this.cabanaService.listar().subscribe({
      next: (cabanas: Cabana[]) => {
        this.cabanas = cabanas;
      },
      error: () => {
        this.mensaje = 'Error al cargar la lista de cabañas';
      }
    });
  }

  guardar(): void {

    this.mensaje = '';

    if (!this.cabana.numero.trim() || !this.cabana.capacidad || this.cabana.tarifaNoche < 0) {
      this.mensaje = 'Complete los campos obligatorios';
      return;
    }

    this.cargando = true;

    const accion = this.editando
      ? this.cabanaService.actualizar(this.cabana.idCabana!, this.cabana)
      : this.cabanaService.crear(this.cabana);

    accion.subscribe({
      next: () => {
        this.cargando = false;

        this.mensajeExito = this.editando
          ? 'Cabaña actualizada correctamente'
          : 'Cabaña registrada correctamente';

        this.cancelarEdicion();
        this.listar();

        setTimeout(() => {
          this.mensajeExito = '';
        }, 3000);
      },
      error: (error: any) => {
        this.cargando = false;

        if (error.status === 400 || error.status === 500) {
          this.mensaje = error.error?.mensaje || 'Error al guardar la cabaña';
        } else {
          this.mensaje = 'Error al guardar la cabaña';
        }
      }
    });
  }

  editar(cabana: Cabana): void {
    this.editando = true;
    this.mensaje = '';
    this.cabana = { ...cabana };
  }

  eliminar(cabana: Cabana): void {

    if (!confirm(`¿Eliminar la cabaña "${cabana.numero}"?`)) {
      return;
    }

    this.cabanaService.eliminar(cabana.idCabana!).subscribe({
      next: () => {
        this.mensajeExito = 'Cabaña eliminada correctamente';

        if (this.editando && this.cabana.idCabana === cabana.idCabana) {
          this.cancelarEdicion();
        }

        this.listar();

        setTimeout(() => {
          this.mensajeExito = '';
        }, 3000);
      },
      error: () => {
        this.mensaje = 'Error al eliminar la cabaña';
      }
    });
  }

  cancelarEdicion(): void {
    this.editando = false;
    this.cabana = this.cabanaVacia();
  }
}