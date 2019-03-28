import { Injectable } from '@angular/core';
import { ProviderServiceModule } from './provider-service.module';
import { SubscriberService } from '../subscriber-service/subscriber.service';
import { loadProvider, loadProviderParams } from '../shared/utils';
import { map, switchMap, filter, tap } from 'rxjs/operators';
import { from, Observable } from 'rxjs';
import { ZapProvider, Curve } from 'zapjs';

@Injectable({
  providedIn: ProviderServiceModule
})
export class ProviderService {

  constructor(private subscriber: SubscriberService) { }

  getProvider(address): Observable<ZapProvider> {
    return this.subscriber.netId$.pipe(
      map(netId => loadProvider(this.subscriber.web3, netId, address)),
    );
  }

  getTitle(provider: ZapProvider) {
    return this.subscriber.netId$.pipe(
      switchMap(netId => from(provider.getTitle())),
    );
  }

  getCurve(provider: ZapProvider, endpoint): Observable<Curve> {
    console.log('getCurve', provider.title, endpoint);
    return this.subscriber.netId$.pipe(
      switchMap(netId => from(provider.getCurve(endpoint))),
      tap(console.log)
    );
  }

  getDotsIssued(provider: ZapProvider, endpoint) {
    return this.subscriber.netId$.pipe(
      switchMap(netId => from(provider.getDotsIssued(endpoint))),
    );
  }

  getEndpointInfo(provider: ZapProvider, endpoint): Observable<{endpointMd: string, endpointJson: string}> {
    return this.subscriber.netId$.pipe(
      switchMap(netId => from(loadProviderParams(provider, endpoint))),
      filter(e => !!e),
      map(e => ({endpointMd: e[0], endpointJson: e[1]}))
    );
  }
}
