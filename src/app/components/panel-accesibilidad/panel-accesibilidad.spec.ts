import { TestBed } from '@angular/core/testing';

import { PanelAccesibilidad } from './panel-accesibilidad';

describe('PanelAccesibilidad', () => {
  beforeEach(async () => {
    localStorage.clear();
    document.documentElement.className = '';
    document.documentElement.style.removeProperty('--escala-interfaz');

    await TestBed.configureTestingModule({
      imports: [PanelAccesibilidad]
    }).compileComponents();
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
    document.documentElement.style.removeProperty('--escala-interfaz');
  });

  it('debe crearse con escala al 100%, contraste desactivado y botones normales', () => {
    const fixture = TestBed.createComponent(PanelAccesibilidad);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(fixture.componentInstance).toBeTruthy();
    expect(compiled.querySelector('.porcentaje')?.textContent?.trim()).toBe('100%');
    expect(document.documentElement.classList.contains('modo-alto-contraste')).toBe(false);
    expect(document.documentElement.classList.contains('modo-botones-grandes')).toBe(false);
  });

  it('debe aumentar la escala hasta un máximo de 150% y reducir hasta 100%', () => {
    const fixture = TestBed.createComponent(PanelAccesibilidad);
    const service = fixture.componentInstance.accesibilidad;
    fixture.detectChanges();

    for (let i = 0; i < 8; i++) {
      service.aumentarEscala();
    }
    expect(service.escala()).toBe(150);
    expect(document.documentElement.style.getPropertyValue('--escala-interfaz')).toBe('1.5');

    for (let i = 0; i < 8; i++) {
      service.reducirEscala();
    }
    expect(service.escala()).toBe(100);
    expect(document.documentElement.style.getPropertyValue('--escala-interfaz')).toBe('1');
  });

  it('debe alternar el modo de alto contraste y los botones grandes y guardarlos en localStorage', () => {
    const fixture = TestBed.createComponent(PanelAccesibilidad);
    const service = fixture.componentInstance.accesibilidad;
    fixture.detectChanges();

    service.alternarAltoContraste();
    service.alternarBotonesGrandes();

    expect(service.altoContraste()).toBe(true);
    expect(service.botonesGrandes()).toBe(true);
    expect(document.documentElement.classList.contains('modo-alto-contraste')).toBe(true);
    expect(document.documentElement.classList.contains('modo-botones-grandes')).toBe(true);

    const guardado = JSON.parse(localStorage.getItem('kutimuy_accesibilidad') || '{}');
    expect(guardado.altoContraste).toBe(true);
    expect(guardado.botonesGrandes).toBe(true);

    service.alternarAltoContraste();
    service.alternarBotonesGrandes();
    expect(document.documentElement.classList.contains('modo-alto-contraste')).toBe(false);
    expect(document.documentElement.classList.contains('modo-botones-grandes')).toBe(false);
  });
});
