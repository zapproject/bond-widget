import { NgModule, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EndpointInfoComponent } from './endpoint-info/endpoint-info.component';
import { createCustomElement } from '@angular/elements';

@NgModule({
  declarations: [
    EndpointInfoComponent,
  ],
  imports: [
    CommonModule
  ],
  entryComponents: [
    EndpointInfoComponent,
  ],
})
export class EndpointInfoModule {
  constructor(injector: Injector) {
    const el = createCustomElement(EndpointInfoComponent, { injector });
    customElements.define('zap-endpoint-info', el);
  }
}
