import { Cliente } from './cliente';

export interface Cotizacion {
  idCotizacion?: number;
  cliente: Partial<Cliente>;
  fecha: string;
  validezHasta?: string;
  subtotal: number;
  descuento: number;
  total: number;
  estado: string;
  observaciones?: string;
}