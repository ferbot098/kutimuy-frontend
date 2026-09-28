import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TipoEvento } from '../../models/tipo-evento';
import { TipoEventoService } from '../../services/tipo-evento';

@Component({
  selector: 'app-tipos-evento',
  imports: [CommonModule, FormsModule],
  templateUrl: './tipos-evento.html',
  styleUrl: './tipos-evento.css'
})
export class TiposEvento implements OnInit {

  tiposEvento: TipoEvento[] = [];
  tipoEvento: TipoEvento = this.tipoVacio();
  editando: boolean = false;
  cargando: boolean = false;
  mensaje: string = '';
  mensajeExito: string = '';

  constructor(private tipoEventoService: TipoEventoService) {}

  ngOnInit(): void {
    this.listar();
  }

  tipoVacio(): TipoEvento {
    return {
      nombre: '',
      descripcion: '',
      activo: true
    };
  }

  listar(): void {
    this.tipoEventoService.listar().subscribe({
      next: (tiposEvento: TipoEvento[]) => {
        this.tiposEvento = tiposEvento;
      },
      error: () => {
        this.mensaje = 'Error al cargar la lista de tipos de evento';
      }
    });
  }

  guardar(): void {

    this.mensaje = '';

    if (!this.tipoEvento.nombre.trim()) {
      this.mensaje = 'Complete los campos obligatorios';
      return;
    }

    this.cargando = true;

    const accion = this.editando
      ? this.tipoEventoService.actualizar(this.tipoEvento.idTipoEvento!, this.tipoEvento)
      : this.tipoEventoService.crear(this.tipoEvento);

    accion.subscribe({
      next: () => {
        this.cargando = false;

        this.mensajeExito = this.editando
          ? 'Tipo de evento actualizado correctamente'
          : 'Tipo de evento registrado correctamente';

        this.cancelarEdicion();
        this.listar();

        setTimeout(() => {
          this.mensajeExito = '';
        }, 3000);
      },
      error: (error: any) => {
        this.cargando = false;

        if (error.status === 400 || error.status === 500) {
          this.mensaje = error.error?.mensaje || 'Error al guardar el tipo de evento';
        } else {
          this.mensaje = 'Error al guardar el tipo de evento';
        }
      }
    });
  }

  editar(tipoEvento: TipoEvento): void {
    this.editando = true;
    this.mensaje = '';
    this.tipoEvento = { ...tipoEvento };
  }

  eliminar(tipoEvento: TipoEvento): void {

    if (!confirm(`¿Eliminar el tipo de evento "${tipoEvento.nombre}"?`)) {
      return;
    }

    this.tipoEventoService.eliminar(tipoEvento.idTipoEvento!).subscribe({
      next: () => {
        this.mensajeExito = 'Tipo de evento eliminado correctamente';

        if (this.editando && this.tipoEvento.idTipoEvento === tipoEvento.idTipoEvento) {
          this.cancelarEdicion();
        }

        this.listar();

        setTimeout(() => {
          this.mensajeExito = '';
        }, 3000);
      },
      error: () => {
        this.mensaje = 'Error al eliminar el tipo de evento';
      }
    });
  }

  cancelarEdicion(): void {
    this.editando = false;
    this.tipoEvento = this.tipoVacio();
  }
}