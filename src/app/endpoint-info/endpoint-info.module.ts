import { NgModule, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EndpointInfoComponent } from './endpoint-info/endpoint-info.component';
import { createCustomElement } from '@angular/elements';
import { ProviderServiceModule } from '../provider-service/provider-service.module';

@NgModule({
  declarations: [
    EndpointInfoComponent,
  ],
  imports: [
    CommonModule,
    ProviderServiceModule,
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
