import { NgModule, Injector, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BondWidgetComponent } from './bond-widget/bond-widget.component';
import { createCustomElement } from '@angular/elements';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    BondWidgetComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  entryComponents: [
    BondWidgetComponent,
  ]
})
export class BondWidgetModule {
  constructor(injector: Injector) {
    const el = createCustomElement(BondWidgetComponent, { injector });
    customElements.define('zap-bond-widget', el);
  }
}
