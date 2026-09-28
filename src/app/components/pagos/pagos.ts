import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Pago } from '../../models/pago';
import { Reserva } from '../../models/reserva';
import { PagoService } from '../../services/pago';
import { ReservaService } from '../../services/reserva';

interface PagoForm {
  idPago?: number;
  idReserva: number;
  fechaPago: string;
  metodo: string;
  monto: number;
  estado: string;
  referencia: string;
}

@Component({
  selector: 'app-pagos',
  imports: [CommonModule, FormsModule],
  templateUrl: './pagos.html',
  styleUrl: './pagos.css'
})
export class Pagos implements OnInit {

  pagos: Pago[] = [];
  reservas: Reserva[] = [];

  form: PagoForm = this.formVacio();
  editando: boolean = false;
  cargando: boolean = false;
  mensaje: string = '';
  mensajeExito: string = '';

  metodos = ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'YAPE', 'PLIN'];
  estados = ['PENDIENTE', 'PAGADO', 'RECHAZADO', 'REEMBOLSADO'];

  constructor(
    private pagoService: PagoService,
    private reservaService: ReservaService
  ) {}

  ngOnInit(): void {
    this.listar();

    this.reservaService.listar().subscribe({
      next: (reservas: Reserva[]) => { this.reservas = reservas; }
    });
  }

  formVacio(): PagoForm {
    return {
      idReserva: 0,
      fechaPago: this.ahoraLocal(),
      metodo: 'EFECTIVO',
      monto: 0,
      estado: 'PENDIENTE',
      referencia: ''
    };
  }

  private ahoraLocal(): string {
    const d = new Date();
    const p = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
  }

  listar(): void {
    this.pagoService.listar().subscribe({
      next: (pagos: Pago[]) => {
        this.pagos = pagos;
      },
      error: () => {
        this.mensaje = 'Error al cargar la lista de pagos';
      }
    });
  }

  guardar(): void {

    this.mensaje = '';

    if (!this.form.idReserva || !this.form.monto || this.form.monto < 0) {
      this.mensaje = 'Complete los campos obligatorios';
      return;
    }

    const pago: Pago = {
      reserva: { idReserva: this.form.idReserva },
      fechaPago: this.form.fechaPago,
      metodo: this.form.metodo,
      monto: this.form.monto,
      estado: this.form.estado,
      referencia: this.form.referencia
    };

    this.cargando = true;

    const accion = this.editando
      ? this.pagoService.actualizar(this.form.idPago!, pago)
      : this.pagoService.crear(pago);

    accion.subscribe({
      next: () => {
        this.cargando = false;

        this.mensajeExito = this.editando
          ? 'Pago actualizado correctamente'
          : 'Pago registrado correctamente';

        this.cancelarEdicion();
        this.listar();

        setTimeout(() => {
          this.mensajeExito = '';
        }, 3000);
      },
      error: (error: any) => {
        this.cargando = false;

        if (error.status === 400 || error.status === 500) {
          this.mensaje = error.error?.mensaje || 'Error al guardar el pago';
        } else {
          this.mensaje = 'Error al guardar el pago';
        }
      }
    });
  }

  editar(pago: Pago): void {
    this.editando = true;
    this.mensaje = '';

    this.form = {
      idPago: pago.idPago,
      idReserva: pago.reserva?.idReserva ?? 0,
      fechaPago: pago.fechaPago,
      metodo: pago.metodo,
      monto: pago.monto,
      estado: pago.estado,
      referencia: pago.referencia ?? ''
    };
  }

  eliminar(pago: Pago): void {

    if (!confirm(`¿Eliminar el pago #${pago.idPago}?`)) {
      return;
    }

    this.pagoService.eliminar(pago.idPago!).subscribe({
      next: () => {
        this.mensajeExito = 'Pago eliminado correctamente';

        if (this.editando && this.form.idPago === pago.idPago) {
          this.cancelarEdicion();
        }

        this.listar();

        setTimeout(() => {
          this.mensajeExito = '';
        }, 3000);
      },
      error: () => {
        this.mensaje = 'Error al eliminar el pago';
      }
    });
  }

  cancelarEdicion(): void {
    this.editando = false;
    this.form = this.formVacio();
  }
}