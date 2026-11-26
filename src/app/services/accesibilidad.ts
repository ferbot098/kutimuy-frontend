import { Injectable, signal } from '@angular/core';

const ESCALA_MIN = 100;
const ESCALA_MAX = 150;
const ESCALA_PASO = 10;
const STORAGE_KEY = 'kutimuy_accesibilidad';

interface EstadoAccesibilidad {
  escala: number;
  altoContraste: boolean;
  botonesGrandes: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AccesibilidadService {

  private readonly _escala = signal<number>(ESCALA_MIN);
  private readonly _altoContraste = signal<boolean>(false);
  private readonly _botonesGrandes = signal<boolean>(false);

  readonly escala = this._escala.asReadonly();
  readonly altoContraste = this._altoContraste.asReadonly();
  readonly botonesGrandes = this._botonesGrandes.asReadonly();

  constructor() {
    this.cargarEstado();
    this.aplicarEstado();
  }

  aumentarEscala(): void {
    const siguiente = Math.min(ESCALA_MAX, this._escala() + ESCALA_PASO);
    if (siguiente !== this._escala()) {
      this._escala.set(siguiente);
      this.guardarYConfirmar();
    }
  }

  reducirEscala(): void {
    const siguiente = Math.max(ESCALA_MIN, this._escala() - ESCALA_PASO);
    if (siguiente !== this._escala()) {
      this._escala.set(siguiente);
      this.guardarYConfirmar();
    }
  }

  alternarAltoContraste(): void {
    this._altoContraste.update(activo => !activo);
    this.guardarYConfirmar();
  }

  alternarBotonesGrandes(): void {
    this._botonesGrandes.update(activo => !activo);
    this.guardarYConfirmar();
  }

  private guardarYConfirmar(): void {
    this.guardarEstado();
    this.aplicarEstado();
  }

  private cargarEstado(): void {
    try {
      const guardado = localStorage.getItem(STORAGE_KEY);
      if (!guardado) {
        return;
      }
      const parsed = JSON.parse(guardado) as Partial<EstadoAccesibilidad>;
      if (typeof parsed.escala === 'number' && Number.isFinite(parsed.escala)) {
        const ajustada = Math.max(ESCALA_MIN, Math.min(ESCALA_MAX, parsed.escala));
        this._escala.set(ajustada);
      }
      if (typeof parsed.altoContraste === 'boolean') {
        this._altoContraste.set(parsed.altoContraste);
      }
      if (typeof parsed.botonesGrandes === 'boolean') {
        this._botonesGrandes.set(parsed.botonesGrandes);
      }
    } catch {
      // Ignora estado corrupto o almacenamiento no disponible.
    }
  }

  private guardarEstado(): void {
    try {
      const estado: EstadoAccesibilidad = {
        escala: this._escala(),
        altoContraste: this._altoContraste(),
        botonesGrandes: this._botonesGrandes()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
    } catch {
      // Ignora errores si localStorage está restringido.
    }
  }

  private aplicarEstado(): void {
    if (typeof document === 'undefined') {
      return;
    }
    const root = document.documentElement;
    root.style.setProperty('--escala-interfaz', String(this._escala() / 100));
    root.classList.toggle('modo-alto-contraste', this._altoContraste());
    root.classList.toggle('modo-botones-grandes', this._botonesGrandes());
  }
}
