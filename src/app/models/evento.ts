import { Espacio } from './espacio';
import { Reserva } from './reserva';

export interface Evento {
  idEvento?: number;
  reserva: Partial<Reserva>;
  espacio: Partial<Espacio>;
  nombre: string;
  tipo: string;
  asistentes: number;
  fechaInicio: string;
  fechaFin: string;
  estado: string;
  notas?: string;
}