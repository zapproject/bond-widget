import { Injectable } from '@angular/core';
import { ProviderServiceModule } from './provider-service.module';
import { SubscriberService } from '../subscriber-service/subscriber.service';
import { loadProviderParams } from '../shared/utils';
import { map, switchMap, filter, catchError } from 'rxjs/operators';
import { from, Observable, of } from 'rxjs';
import { ZapProvider, Curve } from 'zapjs';

@Injectable({
  providedIn: ProviderServiceModule
})
export class ProviderService {
  constructor(private subscriber: SubscriberService) { }

  /* getProvider(address): Observable<ZapProvider> {
    return this.subscriber.netId$.pipe(
      map(netId => loadProvider(this.subscriber.web3, netId, address)),
      catchError(e => {
        console.log(e);
        return of(null);
      }),
    );
  } */

  getTitle(provider: string) {
    if (!provider) return of('');
    console.log('getTitle provider', provider);
    return this.subscriber.registry$.pipe(
      switchMap(registry => {
        return registry.getProviderTitle(provider);
      }),
      catchError(e => {
        console.log('getTitle', e);
        return of('');
      }),
    );
    /* return this.subscriber.netId$.pipe(
      switchMap(netId => from(provider.getTitle())),
    ); */
  }

  getCurveToken(provider: string, endpoint: string): Observable<string> {
    if (!provider || !endpoint) return of(null);
    return this.subscriber.registry$.pipe(
      switchMap(registry => {
        return registry.getEndpointToken(provider, endpoint);
      }),
      catchError(e => {
        console.log('getCurveToken', e);
        return of('0x0');
      }),
    );
  }

  getCurve(provider: string, endpoint: string): Observable<Curve> {
    if (!provider || !endpoint) return of(null);
    return this.subscriber.registry$.pipe(
      switchMap(registry => {
        return registry.getProviderCurve(provider, endpoint);
      }),
      catchError(e => {
        console.log('getCurve', e);
        return of(null);
      }),
    );
    /* return this.subscriber.netId$.pipe(
      switchMap(netId => from(provider.getCurve(endpoint))),
      tap(console.log)
    ); */
  }

  getDotsIssued(provider: string, endpoint: string) {
    if (!provider || !endpoint) return of('');
    return this.subscriber.bondage$.pipe(
      switchMap(bondage => {
        return bondage.getDotsIssued({provider, endpoint});
      }),
      catchError(e => {
        console.log('getDotsIssued', e);
        return of('');
      }),
    );
    /* return this.subscriber.netId$.pipe(
      switchMap(netId => from(provider.getDotsIssued(endpoint))),
    ); */
  }

  getEndpointInfo(provider: ZapProvider, endpoint): Observable<{endpointMd: string; endpointJson: string}> {
    if (!provider || !endpoint) return of({endpointMd: '', endpointJson: ''});
    return this.subscriber.netId$.pipe(
      switchMap(netId => from(loadProviderParams(provider, endpoint))),
      catchError(e => {
        console.log('getEndpointInfo', e);
        return of('');
      }),
      filter(e => !!e),
      map(e => ({endpointMd: e[0], endpointJson: e[1]}))
    );
  }
}
