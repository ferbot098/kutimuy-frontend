import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Cabana } from '../../models/cabana';
import { Cliente } from '../../models/cliente';
import { Cotizacion } from '../../models/cotizacion';
import { Reserva } from '../../models/reserva';
import { ReservaService } from '../../services/reserva';
import { ClienteService } from '../../services/cliente';
import { CabanaService } from '../../services/cabana';
import { CotizacionService } from '../../services/cotizacion';

interface ReservaForm {
  idReserva?: number;
  idCliente: number;
  idCabana: number;
  idCotizacion: number;
  fechaEntrada: string;
  fechaSalida: string;
  adultos: number;
  ninos: number;
  estado: string;
  observaciones: string;
}

@Component({
  selector: 'app-reservas',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reservas.html',
  styleUrl: './reservas.css'
})
export class Reservas implements OnInit {

  reservas: Reserva[] = [];
  clientes: Cliente[] = [];
  cabanas: Cabana[] = [];
  cotizaciones: Cotizacion[] = [];

  form: ReservaForm = this.formVacio();
  editando: boolean = false;
  cargando: boolean = false;
  mensaje: string = '';
  mensajeExito: string = '';
  mostrarBotonPagos: boolean = false;

  estados = ['PENDIENTE', 'CONFIRMADA', 'EN CURSO', 'FINALIZADA', 'CANCELADA'];
  hoy = new Date().toISOString().slice(0, 10);

  constructor(
    private reservaService: ReservaService,
    private clienteService: ClienteService,
    private cabanaService: CabanaService,
    private cotizacionService: CotizacionService
  ) {}

  ngOnInit(): void {
    this.listar();

    this.clienteService.listar().subscribe({
      next: (clientes: Cliente[]) => { this.clientes = clientes; }
    });

    this.cabanaService.listar().subscribe({
      next: (cabanas: Cabana[]) => { this.cabanas = cabanas; }
    });

    this.cotizacionService.listar().subscribe({
      next: (cotizaciones: Cotizacion[]) => { this.cotizaciones = cotizaciones; }
    });
  }

  formVacio(): ReservaForm {
    return {
      idCliente: 0,
      idCabana: 0,
      idCotizacion: 0,
      fechaEntrada: this.hoy,
      fechaSalida: this.hoy,
      adultos: 1,
      ninos: 0,
      estado: 'PENDIENTE',
      observaciones: ''
    };
  }

  listar(): void {
    this.reservaService.listar().subscribe({
      next: (reservas: Reserva[]) => {
        this.reservas = reservas;
      },
      error: () => {
        this.mensaje = 'Error al cargar la lista de reservas';
      }
    });
  }

  guardar(): void {
    this.mensaje = '';
    this.mostrarBotonPagos = false;

    if (!this.form.idCliente || !this.form.idCabana || !this.form.fechaEntrada || !this.form.fechaSalida) {
      this.mensaje = 'Complete los campos obligatorios';
      return;
    }

    const reserva: Reserva = {
      cliente: { idCliente: this.form.idCliente },
      cabana: { idCabana: this.form.idCabana },
      cotizacion: this.form.idCotizacion ? { idCotizacion: this.form.idCotizacion } : null,
      fechaEntrada: this.form.fechaEntrada,
      fechaSalida: this.form.fechaSalida,
      adultos: this.form.adultos,
      ninos: this.form.ninos,
      estado: this.form.estado,
      observaciones: this.form.observaciones
    };

    this.cargando = true;

    const accion = this.editando
      ? this.reservaService.actualizar(this.form.idReserva!, reserva)
      : this.reservaService.crear(reserva);

    accion.subscribe({
      next: () => {
        this.cargando = false;

        this.mensajeExito = this.editando
          ? 'Reserva actualizada correctamente'
          : 'Reserva registrada correctamente';

        this.cancelarEdicion();
        this.listar();

        setTimeout(() => {
          this.mensajeExito = '';
        }, 3000);
      },
      error: (error: any) => {
        this.cargando = false;

        if (error.status === 400 || error.status === 500) {
          this.mensaje = error.error?.mensaje || 'Error al guardar la reserva';
        } else {
          this.mensaje = 'Error al guardar la reserva';
        }
      }
    });
  }

  editar(reserva: Reserva): void {
    this.editando = true;
    this.mensaje = '';
    this.mostrarBotonPagos = false;

    this.form = {
      idReserva: reserva.idReserva,
      idCliente: reserva.cliente?.idCliente ?? 0,
      idCabana: reserva.cabana?.idCabana ?? 0,
      idCotizacion: reserva.cotizacion?.idCotizacion ?? 0,
      fechaEntrada: reserva.fechaEntrada,
      fechaSalida: reserva.fechaSalida,
      adultos: reserva.adultos,
      ninos: reserva.ninos,
      estado: reserva.estado,
      observaciones: reserva.observaciones ?? ''
    };
  }

  eliminar(reserva: Reserva): void {
    this.mensaje = '';
    this.mensajeExito = '';
    this.mostrarBotonPagos = false;

    if (!confirm(`¿Eliminar la reserva #${reserva.idReserva}?`)) {
      return;
    }

    this.reservaService.eliminar(reserva.idReserva!).subscribe({
      next: () => {
        this.mensajeExito = 'Reserva eliminada correctamente';

        if (this.editando && this.form.idReserva === reserva.idReserva) {
          this.cancelarEdicion();
        }

        this.listar();

        setTimeout(() => {
          this.mensajeExito = '';
        }, 3000);
      },
      error: (err: any) => {
        if (err.status === 409) {
          this.mensaje = err.error?.mensaje || `No se puede eliminar la reserva #${reserva.idReserva} porque tiene dependencias activas.`;
          this.mostrarBotonPagos = true;
        } else if (err.error?.mensaje) {
          this.mensaje = err.error.mensaje;
        } else if (typeof err.error === 'string') {
          this.mensaje = err.error;
        } else {
          this.mensaje = `No se pudo eliminar la reserva #${reserva.idReserva}. Intente nuevamente.`;
        }
      }
    });
  }

  cancelarEdicion(): void {
    this.editando = false;
    this.form = this.formVacio();
  }
}