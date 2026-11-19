import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Cliente } from '../../models/cliente';
import { ClienteService } from '../../services/cliente';

@Component({
  selector: 'app-clientes',
  imports: [CommonModule, FormsModule],
  templateUrl: './clientes.html',
  styleUrl: './clientes.css'
})
export class Clientes implements OnInit {

  clientes: Cliente[] = [];
  cliente: Cliente = this.clienteVacio();
  editando: boolean = false;
  cargando: boolean = false;
  mensaje: string = '';
  mensajeExito: string = '';

  constructor(private clienteService: ClienteService) {}

  ngOnInit(): void {
    this.listar();
  }

  clienteVacio(): Cliente {
    return {
      nombres: '',
      apellidos: '',
      documento: '',
      telefono: '',
      email: ''
    };
  }

  listar(): void {
    this.clienteService.listar().subscribe({
      next: (clientes: Cliente[]) => {
        this.clientes = clientes;
      },
      error: () => {
        this.mensaje = 'Error al cargar la lista de clientes';
      }
    });
  }

  guardar(): void {

    this.mensaje = '';

    if (
      !this.cliente.nombres.trim() ||
      !this.cliente.apellidos.trim() ||
      !this.cliente.documento.trim()
    ) {
      this.mensaje = 'Complete los campos obligatorios';
      return;
    }

    this.cargando = true;

    const accion = this.editando
      ? this.clienteService.actualizar(this.cliente.idCliente!, this.cliente)
      : this.clienteService.crear(this.cliente);

    accion.subscribe({
      next: () => {
        this.cargando = false;

        this.mensajeExito = this.editando
          ? 'Cliente actualizado correctamente'
          : 'Cliente registrado correctamente';

        this.cancelarEdicion();
        this.listar();

        setTimeout(() => {
          this.mensajeExito = '';
        }, 3000);
      },
      error: (error: any) => {
        this.cargando = false;

        if (error.status === 400 || error.status === 500) {
          this.mensaje = error.error?.mensaje || 'Error al guardar el cliente';
        } else {
          this.mensaje = 'Error al guardar el cliente';
        }
      }
    });
  }

  editar(cliente: Cliente): void {
    this.editando = true;
    this.mensaje = '';
    this.cliente = { ...cliente };
  }

  eliminar(cliente: Cliente): void {

    if (!confirm(`¿Eliminar al cliente "${cliente.nombres} ${cliente.apellidos}"?`)) {
      return;
    }

    this.clienteService.eliminar(cliente.idCliente!).subscribe({
      next: () => {
        this.mensajeExito = 'Cliente eliminado correctamente';

        if (this.editando && this.cliente.idCliente === cliente.idCliente) {
          this.cancelarEdicion();
        }

        this.listar();

        setTimeout(() => {
          this.mensajeExito = '';
        }, 3000);
      },
      error: () => {
        this.mensaje = 'Error al eliminar el cliente';
      }
    });
  }

  cancelarEdicion(): void {
    this.editando = false;
    this.cliente = this.clienteVacio();
  }
}