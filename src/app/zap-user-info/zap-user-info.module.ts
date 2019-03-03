import { NgModule, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZapUserInfoComponent } from './zap-user-info/zap-user-info.component';
import { createCustomElement } from '@angular/elements';
import { FormatPriceModule } from '../format-price/format-price.module';

@NgModule({
  declarations: [
    ZapUserInfoComponent,
  ],
  imports: [
    CommonModule,
    FormatPriceModule,
  ],
  entryComponents: [
    ZapUserInfoComponent,
  ],
})
export class ZapUserInfoModule {
  constructor(injector: Injector) {
    const el = createCustomElement(ZapUserInfoComponent, { injector });
    customElements.define('zap-user-info', el);
  }
}
