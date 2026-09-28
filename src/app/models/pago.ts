import { Reserva } from './reserva';

export interface Pago {
  idPago?: number;
  reserva: Partial<Reserva>;
  fechaPago: string;
  metodo: string;
  monto: number;
  estado: string;
  referencia?: string;
}