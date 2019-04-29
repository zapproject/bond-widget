import { NgModule, Injector, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { createCustomElement } from '@angular/elements';
import { SubscriberModule } from '../subscriber-service/subscriber-service.module';
import { BondWidgetComponent } from './bond-widget/bond-widget.component';

@NgModule({
  declarations: [
    BondWidgetComponent,
  ],
  imports: [
    CommonModule,
    SubscriberModule,
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
