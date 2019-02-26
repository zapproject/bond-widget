import { NgModule, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZapMarkdownComponent } from './zap-markdown/zap-markdown.component';
import { createCustomElement } from '@angular/elements';

@NgModule({
  declarations: [
    ZapMarkdownComponent,
  ],
  imports: [
    CommonModule
  ],
  entryComponents: [
    ZapMarkdownComponent,
  ],
})
export class ZapMarkdownModule {
  constructor(injector: Injector) {
    const el = createCustomElement(ZapMarkdownComponent, { injector });
    customElements.define('zap-markdown', el);
  }
}
