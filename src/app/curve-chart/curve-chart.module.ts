import { NgModule, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurveChartComponent } from './curve-chart/curve-chart.component';
import { createCustomElement } from '@angular/elements';

@NgModule({
  declarations: [
    CurveChartComponent
  ],
  imports: [
    CommonModule
  ],
  entryComponents: [
    CurveChartComponent,
  ]
})
export class CurveChartModule {
  constructor(injector: Injector) {
    const el = createCustomElement(CurveChartComponent, { injector });
    customElements.define('zap-curve-chart', el);
  }
}
