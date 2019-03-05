import { NgModule, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionInfoComponent } from './transaction-info/transaction-info.component';
import { createCustomElement } from '@angular/elements';

@NgModule({
  declarations: [
    TransactionInfoComponent,
  ],
  imports: [
    CommonModule
  ],
  entryComponents: [
    TransactionInfoComponent,
  ],
})
export class TransactionInfoModule {
  constructor(injector: Injector) {
    const el = createCustomElement(TransactionInfoComponent, { injector });
    customElements.define('zap-transaction-info', el);
  }
}
