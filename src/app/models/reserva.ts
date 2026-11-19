import { Cabana } from './cabana';
import { Cliente } from './cliente';
import { Cotizacion } from './cotizacion';

export interface Reserva {
  idReserva?: number;
  cliente: Partial<Cliente>;
  cabana: Partial<Cabana>;
  cotizacion?: Partial<Cotizacion> | null;
  fechaEntrada: string;
  fechaSalida: string;
  adultos: number;
  ninos: number;
  estado: string;
  total?: number;
  observaciones?: string;
}