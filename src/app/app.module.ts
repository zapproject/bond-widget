import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BondFormModule } from './bond-form/bond-form.module';
import { EndpointInfoModule } from './endpoint-info/endpoint-info.module';
import { CurveChartModule } from './curve-chart/curve-chart.module';
import { ProviderBondWidgetModule } from './provider-bond-widget/provider-bond-widget.module';
// import { ZapLoginModule } from './zap-login/zap-login.module';
import { ZapUserInfoModule } from './zap-user-info/zap-user-info.module';
import { ZapMarkdownModule } from './zap-markdown/zap-markdown.module';
import { TransactionInfoModule } from './transaction-info/transaction-info.module';
import { TokenBondWidgetModule } from './token-bond-widget/token-bond-widget.module';
import { BondWidgetModule } from './bond-widget/bond-widget.module';


@NgModule({
  declarations: [
  ],
  imports: [
    BrowserModule,
    BondFormModule,
    EndpointInfoModule,
    CurveChartModule,
    ProviderBondWidgetModule,
    // ZapLoginModule,
    ZapUserInfoModule,
    ZapMarkdownModule,
    TransactionInfoModule,
    TokenBondWidgetModule,
    BondWidgetModule,
  ],
})
export class AppModule {
  ngDoBootstrap() {
  }
}
