import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Cliente } from '../../models/cliente';
import { Cotizacion } from '../../models/cotizacion';
import { CotizacionService } from '../../services/cotizacion';
import { ClienteService } from '../../services/cliente';

interface CotizacionForm {
  idCotizacion?: number;
  idCliente: number;
  fecha: string;
  validezHasta: string;
  subtotal: number;
  descuento: number;
  total: number;
  estado: string;
  observaciones: string;
}

@Component({
  selector: 'app-cotizaciones',
  imports: [CommonModule, FormsModule],
  templateUrl: './cotizaciones.html',
  styleUrl: './cotizaciones.css'
})
export class Cotizaciones implements OnInit {

  cotizaciones: Cotizacion[] = [];
  clientes: Cliente[] = [];

  form: CotizacionForm = this.formVacio();
  editando: boolean = false;
  cargando: boolean = false;
  mensaje: string = '';
  mensajeExito: string = '';

  estados = ['PENDIENTE', 'ENVIADA', 'ACEPTADA', 'RECHAZADA'];
  hoy = new Date().toISOString().slice(0, 10);

  constructor(
    private cotizacionService: CotizacionService,
    private clienteService: ClienteService
  ) {}

  ngOnInit(): void {
    this.listar();

    this.clienteService.listar().subscribe({
      next: (clientes: Cliente[]) => { this.clientes = clientes; }
    });
  }

  formVacio(): CotizacionForm {
    return {
      idCliente: 0,
      fecha: this.hoy,
      validezHasta: '',
      subtotal: 0,
      descuento: 0,
      total: 0,
      estado: 'PENDIENTE',
      observaciones: ''
    };
  }

  listar(): void {
    this.cotizacionService.listar().subscribe({
      next: (cotizaciones: Cotizacion[]) => {
        this.cotizaciones = cotizaciones;
      },
      error: () => {
        this.mensaje = 'Error al cargar la lista de cotizaciones';
      }
    });
  }

  calcularTotal(): void {
    const subtotal = Number(this.form.subtotal) || 0;
    const descuento = Number(this.form.descuento) || 0;
    this.form.total = Math.max(0, subtotal - descuento);
  }

  guardar(): void {

    this.mensaje = '';

    if (!this.form.idCliente || !this.form.fecha) {
      this.mensaje = 'Complete los campos obligatorios';
      return;
    }

    this.calcularTotal();

    const cotizacion: Cotizacion = {
      cliente: { idCliente: this.form.idCliente },
      fecha: this.form.fecha,
      validezHasta: this.form.validezHasta || undefined,
      subtotal: this.form.subtotal,
      descuento: this.form.descuento,
      total: this.form.total,
      estado: this.form.estado,
      observaciones: this.form.observaciones
    };

    this.cargando = true;

    const accion = this.editando
      ? this.cotizacionService.actualizar(this.form.idCotizacion!, cotizacion)
      : this.cotizacionService.crear(cotizacion);

    accion.subscribe({
      next: () => {
        this.cargando = false;

        this.mensajeExito = this.editando
          ? 'Cotización actualizada correctamente'
          : 'Cotización registrada correctamente';

        this.cancelarEdicion();
        this.listar();

        setTimeout(() => {
          this.mensajeExito = '';
        }, 3000);
      },
      error: (error: any) => {
        this.cargando = false;

        if (error.status === 400 || error.status === 500) {
          this.mensaje = error.error?.mensaje || 'Error al guardar la cotización';
        } else {
          this.mensaje = 'Error al guardar la cotización';
        }
      }
    });
  }

  editar(cotizacion: Cotizacion): void {
    this.editando = true;
    this.mensaje = '';

    this.form = {
      idCotizacion: cotizacion.idCotizacion,
      idCliente: cotizacion.cliente?.idCliente ?? 0,
      fecha: cotizacion.fecha,
      validezHasta: cotizacion.validezHasta ?? '',
      subtotal: cotizacion.subtotal,
      descuento: cotizacion.descuento,
      total: cotizacion.total,
      estado: cotizacion.estado,
      observaciones: cotizacion.observaciones ?? ''
    };
  }

  eliminar(cotizacion: Cotizacion): void {

    if (!confirm(`¿Eliminar la cotización #${cotizacion.idCotizacion}?`)) {
      return;
    }

    this.cotizacionService.eliminar(cotizacion.idCotizacion!).subscribe({
      next: () => {
        this.mensajeExito = 'Cotización eliminada correctamente';

        if (this.editando && this.form.idCotizacion === cotizacion.idCotizacion) {
          this.cancelarEdicion();
        }

        this.listar();

        setTimeout(() => {
          this.mensajeExito = '';
        }, 3000);
      },
      error: () => {
        this.mensaje = 'Error al eliminar la cotización';
      }
    });
  }

  cancelarEdicion(): void {
    this.editando = false;
    this.form = this.formVacio();
  }
}