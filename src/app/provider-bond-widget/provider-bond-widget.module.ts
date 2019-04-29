import { NgModule, Injector, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { createCustomElement } from '@angular/elements';
import { SharedModule } from '../shared/shared.module';
import { BondServiceModule } from '../bond-service/bond-service.module';
import { SubscriberModule } from '../subscriber-service/subscriber-service.module';
import { ProviderServiceModule } from '../provider-service/provider-service.module';
import { PorviderBondWidgetComponent } from './provider-bond-widget/provider-bond-widget.component';

@NgModule({
  declarations: [
    PorviderBondWidgetComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    SubscriberModule,
    BondServiceModule,
    ProviderServiceModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  entryComponents: [
    PorviderBondWidgetComponent,
  ]
})
export class ProviderBondWidgetModule {
  constructor(injector: Injector) {
    const el = createCustomElement(PorviderBondWidgetComponent, { injector });
    customElements.define('zap-provider-bond-widget', el);
  }
}
