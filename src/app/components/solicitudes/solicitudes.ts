import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Cliente } from '../../models/cliente';
import { Solicitud } from '../../models/solicitud';
import { SolicitudService } from '../../services/solicitud';
import { ClienteService } from '../../services/cliente';

interface SolicitudForm {
  idSolicitud?: number;
  idCliente: number;
  tipo: string;
  fecha: string;
  estado: string;
  observaciones: string;
}

@Component({
  selector: 'app-solicitudes',
  imports: [CommonModule, FormsModule],
  templateUrl: './solicitudes.html',
  styleUrl: './solicitudes.css'
})
export class Solicitudes implements OnInit {

  solicitudes: Solicitud[] = [];
  clientes: Cliente[] = [];

  form: SolicitudForm = this.formVacio();
  editando: boolean = false;
  cargando: boolean = false;
  mensaje: string = '';
  mensajeExito: string = '';

  tipos = ['RESERVA', 'EVENTO', 'INFORMACION', 'OTRO'];
  estados = ['PENDIENTE', 'ATENDIDA', 'CANCELADA'];
  hoy = new Date().toISOString().slice(0, 10);

  constructor(
    private solicitudService: SolicitudService,
    private clienteService: ClienteService
  ) {}

  ngOnInit(): void {
    this.listar();

    this.clienteService.listar().subscribe({
      next: (clientes: Cliente[]) => { this.clientes = clientes; }
    });
  }

  formVacio(): SolicitudForm {
    return {
      idCliente: 0,
      tipo: 'RESERVA',
      fecha: this.hoy,
      estado: 'PENDIENTE',
      observaciones: ''
    };
  }

  listar(): void {
    this.solicitudService.listar().subscribe({
      next: (solicitudes: Solicitud[]) => {
        this.solicitudes = solicitudes;
      },
      error: () => {
        this.mensaje = 'Error al cargar la lista de solicitudes';
      }
    });
  }

  guardar(): void {

    this.mensaje = '';

    if (!this.form.idCliente || !this.form.fecha) {
      this.mensaje = 'Complete los campos obligatorios';
      return;
    }

    const solicitud: Solicitud = {
      cliente: { idCliente: this.form.idCliente },
      tipo: this.form.tipo,
      fecha: this.form.fecha,
      estado: this.form.estado,
      observaciones: this.form.observaciones
    };

    this.cargando = true;

    const accion = this.editando
      ? this.solicitudService.actualizar(this.form.idSolicitud!, solicitud)
      : this.solicitudService.crear(solicitud);

    accion.subscribe({
      next: () => {
        this.cargando = false;

        this.mensajeExito = this.editando
          ? 'Solicitud actualizada correctamente'
          : 'Solicitud registrada correctamente';

        this.cancelarEdicion();
        this.listar();

        setTimeout(() => {
          this.mensajeExito = '';
        }, 3000);
      },
      error: (error: any) => {
        this.cargando = false;

        if (error.status === 400 || error.status === 500) {
          this.mensaje = error.error?.mensaje || 'Error al guardar la solicitud';
        } else {
          this.mensaje = 'Error al guardar la solicitud';
        }
      }
    });
  }

  editar(solicitud: Solicitud): void {
    this.editando = true;
    this.mensaje = '';

    this.form = {
      idSolicitud: solicitud.idSolicitud,
      idCliente: solicitud.cliente?.idCliente ?? 0,
      tipo: solicitud.tipo,
      fecha: solicitud.fecha,
      estado: solicitud.estado,
      observaciones: solicitud.observaciones ?? ''
    };
  }

  eliminar(solicitud: Solicitud): void {

    if (!confirm(`¿Eliminar la solicitud #${solicitud.idSolicitud}?`)) {
      return;
    }

    this.solicitudService.eliminar(solicitud.idSolicitud!).subscribe({
      next: () => {
        this.mensajeExito = 'Solicitud eliminada correctamente';

        if (this.editando && this.form.idSolicitud === solicitud.idSolicitud) {
          this.cancelarEdicion();
        }

        this.listar();

        setTimeout(() => {
          this.mensajeExito = '';
        }, 3000);
      },
      error: () => {
        this.mensaje = 'Error al eliminar la solicitud';
      }
    });
  }

  cancelarEdicion(): void {
    this.editando = false;
    this.form = this.formVacio();
  }
}