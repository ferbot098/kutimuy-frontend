import { Cliente } from './cliente';

export interface Solicitud {
  idSolicitud?: number;
  cliente: Partial<Cliente>;
  tipo: string;
  fecha: string;
  estado: string;
  observaciones?: string;
}