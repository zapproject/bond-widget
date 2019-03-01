import { NgModule, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZapMessageComponent } from './zap-message/zap-message.component';
import { createCustomElement } from '@angular/elements';

@NgModule({
  declarations: [
    ZapMessageComponent,
  ],
  imports: [
    CommonModule
  ],
  exports: [
  ],
  entryComponents: [
    ZapMessageComponent,
  ]
})
export class SharedModule {
  constructor(injector: Injector) {
    const el = createCustomElement(ZapMessageComponent, { injector });
    customElements.define('zap-message', el);
  }
}
