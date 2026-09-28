import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Espacio } from '../../models/espacio';
import { Evento } from '../../models/evento';
import { Reserva } from '../../models/reserva';
import { TipoEvento } from '../../models/tipo-evento';
import { EventoService } from '../../services/evento';
import { ReservaService } from '../../services/reserva';
import { EspacioService } from '../../services/espacio';
import { TipoEventoService } from '../../services/tipo-evento';

interface EventoForm {
  idEvento?: number;
  idReserva: number;
  idEspacio: number;
  nombre: string;
  tipo: string;
  asistentes: number;
  fechaInicio: string;
  fechaFin: string;
  estado: string;
  notas: string;
}

@Component({
  selector: 'app-eventos',
  imports: [CommonModule, FormsModule],
  templateUrl: './eventos.html',
  styleUrl: './eventos.css'
})
export class Eventos implements OnInit {

  eventos: Evento[] = [];
  reservas: Reserva[] = [];
  espacios: Espacio[] = [];
  tiposEvento: TipoEvento[] = [];

  form: EventoForm = this.formVacio();
  editando: boolean = false;
  cargando: boolean = false;
  mensaje: string = '';
  mensajeExito: string = '';

  estados = ['PENDIENTE', 'CONFIRMADO', 'EN CURSO', 'FINALIZADO', 'CANCELADO'];

  constructor(
    private eventoService: EventoService,
    private reservaService: ReservaService,
    private espacioService: EspacioService,
    private tipoEventoService: TipoEventoService
  ) {}

  ngOnInit(): void {
    this.listar();

    this.reservaService.listar().subscribe({
      next: (reservas: Reserva[]) => { this.reservas = reservas; }
    });

    this.espacioService.listar().subscribe({
      next: (espacios: Espacio[]) => { this.espacios = espacios; }
    });

    this.tipoEventoService.listar().subscribe({
      next: (tiposEvento: TipoEvento[]) => { this.tiposEvento = tiposEvento; }
    });
  }

  formVacio(): EventoForm {
    const ahora = this.ahoraLocal();
    return {
      idReserva: 0,
      idEspacio: 0,
      nombre: '',
      tipo: '',
      asistentes: 10,
      fechaInicio: ahora,
      fechaFin: ahora,
      estado: 'PENDIENTE',
      notas: ''
    };
  }

  private ahoraLocal(): string {
    const d = new Date();
    const p = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
  }

  listar(): void {
    this.eventoService.listar().subscribe({
      next: (eventos: Evento[]) => {
        this.eventos = eventos;
      },
      error: () => {
        this.mensaje = 'Error al cargar la lista de eventos';
      }
    });
  }

  guardar(): void {

    this.mensaje = '';

    if (!this.form.idReserva || !this.form.idEspacio || !this.form.nombre.trim() || !this.form.tipo) {
      this.mensaje = 'Complete los campos obligatorios';
      return;
    }

    const evento: Evento = {
      reserva: { idReserva: this.form.idReserva },
      espacio: { idEspacio: this.form.idEspacio },
      nombre: this.form.nombre,
      tipo: this.form.tipo,
      asistentes: this.form.asistentes,
      fechaInicio: this.form.fechaInicio,
      fechaFin: this.form.fechaFin,
      estado: this.form.estado,
      notas: this.form.notas
    };

    this.cargando = true;

    const accion = this.editando
      ? this.eventoService.actualizar(this.form.idEvento!, evento)
      : this.eventoService.crear(evento);

    accion.subscribe({
      next: () => {
        this.cargando = false;

        this.mensajeExito = this.editando
          ? 'Evento actualizado correctamente'
          : 'Evento registrado correctamente';

        this.cancelarEdicion();
        this.listar();

        setTimeout(() => {
          this.mensajeExito = '';
        }, 3000);
      },
      error: (error: any) => {
        this.cargando = false;

        if (error.status === 400 || error.status === 500) {
          this.mensaje = error.error?.mensaje || 'Error al guardar el evento';
        } else {
          this.mensaje = 'Error al guardar el evento';
        }
      }
    });
  }

  editar(evento: Evento): void {
    this.editando = true;
    this.mensaje = '';

    this.form = {
      idEvento: evento.idEvento,
      idReserva: evento.reserva?.idReserva ?? 0,
      idEspacio: evento.espacio?.idEspacio ?? 0,
      nombre: evento.nombre,
      tipo: evento.tipo,
      asistentes: evento.asistentes,
      fechaInicio: evento.fechaInicio,
      fechaFin: evento.fechaFin,
      estado: evento.estado,
      notas: evento.notas ?? ''
    };
  }

  eliminar(evento: Evento): void {

    if (!confirm(`¿Eliminar el evento "${evento.nombre}"?`)) {
      return;
    }

    this.eventoService.eliminar(evento.idEvento!).subscribe({
      next: () => {
        this.mensajeExito = 'Evento eliminado correctamente';

        if (this.editando && this.form.idEvento === evento.idEvento) {
          this.cancelarEdicion();
        }

        this.listar();

        setTimeout(() => {
          this.mensajeExito = '';
        }, 3000);
      },
      error: () => {
        this.mensaje = 'Error al eliminar el evento';
      }
    });
  }

  cancelarEdicion(): void {
    this.editando = false;
    this.form = this.formVacio();
  }
}