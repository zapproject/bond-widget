import { NgModule, Injector, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TokenBondWidgetComponent } from './token-bond-widget/token-bond-widget.component';
import { SharedModule } from '../shared/shared.module';
import { createCustomElement } from '@angular/elements';
import { ProviderServiceModule } from '../provider-service/provider-service.module';
import { SubscriberModule } from '../subscriber-service/subscriber-service.module';
import { TokenServiceModule } from '../token-service/token-service.module';
;

@NgModule({
  declarations: [
    TokenBondWidgetComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    ProviderServiceModule,
    SubscriberModule,
    TokenServiceModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  entryComponents: [
    TokenBondWidgetComponent,
  ]
})
export class TokenBondWidgetModule {
  constructor(injector: Injector) {
    const el = createCustomElement(TokenBondWidgetComponent, { injector });
    customElements.define('zap-token-bond-widget', el);
  }
}