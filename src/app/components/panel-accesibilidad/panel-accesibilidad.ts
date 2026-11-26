import { Component, inject } from '@angular/core';

import { AccesibilidadService } from '../../services/accesibilidad';

@Component({
  selector: 'app-panel-accesibilidad',
  templateUrl: './panel-accesibilidad.html',
  styleUrl: './panel-accesibilidad.css'
})
export class PanelAccesibilidad {
  readonly accesibilidad = inject(AccesibilidadService);
}
