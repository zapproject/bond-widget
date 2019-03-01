import { NgModule, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BondFormComponent } from './bond-form/bond-form.component';
import { createCustomElement } from '@angular/elements';
import { BrowserModule } from '@angular/platform-browser';
import { FormatPriceModule } from '../format-price/format-price.module';

@NgModule({
  declarations: [
    BondFormComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    FormatPriceModule,
  ],
  entryComponents: [
    BondFormComponent
  ],
})
export class BondFormModule {
  constructor(injector: Injector) {
    const el = createCustomElement(BondFormComponent, { injector });
    customElements.define('zap-bond-form', el);
  }
}
