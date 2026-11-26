import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { PanelAccesibilidad } from './components/panel-accesibilidad/panel-accesibilidad';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, PanelAccesibilidad],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}
