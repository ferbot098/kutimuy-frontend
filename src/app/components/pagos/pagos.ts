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
  procesandoSimulacion: boolean = false;
  mensaje: string = '';
  mensajeExito: string = '';

  metodos = ['EFECTIVO', 'TARJETA', 'YAPE', 'PLIN', 'TRANSFERENCIA'];
  estados = ['PAGADO', 'PENDIENTE', 'RECHAZADO', 'REEMBOLSADO'];

  // Variables para la simulación realista
  efectivoRecibido: number = 0;
  vuelto: number = 0;

  tarjetaNumero: string = '';
  tarjetaVencimiento: string = '';
  tarjetaCvv: string = '';

  celularRemitente: string = '';

  // Control del Comprobante / Ticket Digital
  mostrarComprobante: boolean = false;
  comprobanteActual: any = null;

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
    this.efectivoRecibido = 0;
    this.vuelto = 0;
    this.tarjetaNumero = '';
    this.tarjetaVencimiento = '';
    this.tarjetaCvv = '';
    this.celularRemitente = '';

    return {
      idReserva: 0,
      fechaPago: this.ahoraLocal(),
      metodo: 'EFECTIVO',
      monto: 0,
      estado: 'PAGADO',
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

  calcularVuelto(): void {
    if (this.efectivoRecibido >= this.form.monto) {
      this.vuelto = Number((this.efectivoRecibido - this.form.monto).toFixed(2));
    } else {
      this.vuelto = 0;
    }
  }

  guardar(): void {
    this.mensaje = '';

    if (!this.form.idReserva || !this.form.monto || this.form.monto <= 0) {
      this.mensaje = 'Seleccione una reserva e ingrese un monto válido';
      return;
    }

    // Validaciones específicas de simulación
    if (this.form.metodo === 'EFECTIVO' && this.efectivoRecibido > 0 && this.efectivoRecibido < this.form.monto) {
      this.mensaje = 'El monto entregado en efectivo es menor al total a pagar';
      return;
    }

    if (this.form.metodo === 'TARJETA' && !this.editando) {
      if (this.tarjetaNumero.replace(/\s/g, '').length < 16 || !this.tarjetaVencimiento || this.tarjetaCvv.length < 3) {
        this.mensaje = 'Complete todos los datos de la tarjeta (16 dígitos, exp, CVV)';
        return;
      }
    }

    // Generación de referencia simulada si el usuario no ingresó una manual
    let referenciaFinal = this.form.referencia;
    const numRandom = Math.floor(100000 + Math.random() * 900000);

    if (!referenciaFinal) {
      if (this.form.metodo === 'TARJETA') {
        const ultimos4 = this.tarjetaNumero.replace(/\s/g, '').slice(-4) || '9012';
        referenciaFinal = `AUTH-${numRandom} (**** ${ultimos4})`;
      } else if (this.form.metodo === 'YAPE') {
        referenciaFinal = `YAP-${numRandom}`;
      } else if (this.form.metodo === 'PLIN') {
        referenciaFinal = `PLN-${numRandom}`;
      } else {
        referenciaFinal = `EFE-${numRandom}`;
      }
    }

    const pago: Pago = {
      reserva: { idReserva: this.form.idReserva },
      fechaPago: this.form.fechaPago,
      metodo: this.form.metodo,
      monto: this.form.monto,
      estado: this.form.estado,
      referencia: referenciaFinal
    };

    // Simulación de latencia de red bancaria (1.2 segundos)
    this.cargando = true;
    this.procesandoSimulacion = true;

    setTimeout(() => {
      const accion = this.editando
        ? this.pagoService.actualizar(this.form.idPago!, pago)
        : this.pagoService.crear(pago);

      accion.subscribe({
        next: (pagoGuardado: Pago) => {
          this.cargando = false;
          this.procesandoSimulacion = false;

          const reservaSel = this.reservas.find(r => r.idReserva === pagoGuardado.reserva?.idReserva);

          // Concatenación de nombres y apellidos completos
          const nombres = reservaSel?.cliente?.nombres || '';
          const apellidos = reservaSel?.cliente?.apellidos || '';
          const clienteNombreCompleto = `${nombres} ${apellidos}`.trim() || 'Huésped Kutimuy';

          // Preparar datos del voucher/comprobante emitido
          this.comprobanteActual = {
            idPago: pagoGuardado.idPago,
            cliente: clienteNombreCompleto,
            idReserva: pagoGuardado.reserva?.idReserva,
            fecha: pagoGuardado.fechaPago,
            metodo: pagoGuardado.metodo,
            monto: pagoGuardado.monto,
            referencia: pagoGuardado.referencia,
            vuelto: this.vuelto
          };

          this.mostrarComprobante = true;
          this.mensajeExito = this.editando ? 'Pago actualizado con éxito' : 'Pago procesado y aprobado exitosamente';

          this.cancelarEdicion();
          this.listar();

          setTimeout(() => {
            this.mensajeExito = '';
          }, 4000);
        },
        error: (error: any) => {
          this.cargando = false;
          this.procesandoSimulacion = false;
          this.mensaje = error.error?.mensaje || 'Error al procesar la transacción';
        }
      });
    }, 1200);
  }

  cerrarComprobante(): void {
    this.mostrarComprobante = false;
    this.comprobanteActual = null;
  }

  imprimirComprobante(): void {
    window.print();
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
        setTimeout(() => { this.mensajeExito = ''; }, 3000);
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