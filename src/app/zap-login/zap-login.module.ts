import { NgModule, Injector, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZapLoginComponent } from './zap-login/zap-login.component';
import { createCustomElement } from '@angular/elements';
import { SubscriberModule } from '../subscriber-service/subscriber-service.module';

@NgModule({
  declarations: [
    ZapLoginComponent
  ],
  imports: [
    CommonModule,
    SubscriberModule,
  ],
  entryComponents: [
    ZapLoginComponent
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
  ]
})
export class ZapLoginModule {
  constructor(injector: Injector) {
    const el = createCustomElement(ZapLoginComponent, { injector });
    customElements.define('zap-login', el);
  }
}
