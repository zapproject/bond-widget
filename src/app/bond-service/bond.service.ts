import { Observable } from 'rxjs';
import { switchMap, filter } from 'rxjs/operators';
import { ZapSubscriber } from 'zapjs';
import BigNumber from 'bignumber.js';
import { Injectable } from '@angular/core';
import { BondServiceModule } from './bond-service.module';
import { SubscriberService } from '../subscriber-service/subscriber.service';
import { getGasPrice, gas } from '../shared/get-gas-price';

@Injectable({
  providedIn: BondServiceModule
})
export class BondService {

  subscriber$: Observable<ZapSubscriber>;

  constructor(private zap: SubscriberService) {
    this.subscriber$ = zap.subscriber$;
  }

  bond(provider: string, endpoint: string, dots): Observable<{result: any; error: any}> {
    return this.subscriber$.pipe(
      filter(subscriber => !!subscriber && subscriber instanceof ZapSubscriber),
      switchMap(subscriber => getGasPrice().then(gasPrice => subscriber.bond({provider, endpoint, dots, gas, gasPrice})
        .then(result => ({result, error: null}))
        .catch(error => ({error, result: null}))
      )),
    );
  }

  unbond(provider: string, endpoint: string, dots): Observable<{result: any; error: any}> {
    return this.subscriber$.pipe(
      filter(subscriber => !!subscriber && subscriber instanceof ZapSubscriber),
      switchMap(subscriber => getGasPrice().then(gasPrice => subscriber.unBond({provider, endpoint, dots, gas, gasPrice})
        .then(result => ({result, error: null}))
        .catch(error => ({error, result: null}))
      )),
    );
  }

  approve(zap: number): Observable<{result: any; error: any}> {
    return this.subscriber$.pipe(
      filter(subscriber => !!subscriber && subscriber instanceof ZapSubscriber),
      switchMap(subscriber => {
        const approve: Promise<any> = getGasPrice().then(gasPrice => subscriber.zapToken.contract.methods.approve(
          subscriber.zapBondage.contract._address, (new BigNumber(zap)).toFixed(),
        ).send({
          from: subscriber.subscriberOwner,
          gasPrice,
          gas,
        }));
        return approve
          .then(result => ({result, error: null}))
          .catch(error => ({error, result: null}));
      }),
    );
  }
}
