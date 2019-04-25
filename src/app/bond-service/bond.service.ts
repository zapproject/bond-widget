import { Observable } from 'rxjs';
import { switchMap, filter } from 'rxjs/operators';
import { ZapSubscriber, Types } from 'zapjs';
import BigNumber from 'bignumber.js';
import { Injectable } from '@angular/core';
import { BondServiceModule } from './bond-service.module';
import { SubscriberService } from '../subscriber-service/subscriber.service';

@Injectable({
  providedIn: BondServiceModule
})
export class BondService {

  subscriber$: Observable<ZapSubscriber>

  constructor(private zap: SubscriberService) {
    this.subscriber$ = zap.subscriber$;
  }

  bond(provider: string, endpoint: string, dots): Observable<{result: any; error: any}> {
    return this.subscriber$.pipe(
      filter(subscriber => !!subscriber && subscriber instanceof ZapSubscriber),
      switchMap(subscriber => subscriber.bond({provider, endpoint, dots})
        .then(result => ({result, error: null}))
        .catch(error => ({error, result: null}))
      ),
    );
  }

  unbond(provider: string, endpoint: string, dots): Observable<{result: any; error: any}> {
    return this.subscriber$.pipe(
      filter(subscriber => !!subscriber && subscriber instanceof ZapSubscriber),
      switchMap(subscriber => subscriber.unBond({provider, endpoint, dots})
        .then(result => ({result, error: null}))
        .catch(error => ({error, result: null}))
      ),
    );
  }

  approve(zap: number): Observable<{result: any; error: any}> {
    return this.subscriber$.pipe(
      filter(subscriber => !!subscriber && subscriber instanceof ZapSubscriber),
      switchMap(subscriber => {
        const approve: Promise<any> = subscriber.zapToken.contract.methods.approve(
          subscriber.zapBondage.contract._address, (new BigNumber(zap)).toFixed(),
        ).send({
          from: subscriber.subscriberOwner,
          gas: Types.DEFAULT_GAS,
        });
        return approve
          .then(result => ({result, error: null}))
          .catch(error => ({error, result: null}));
      }),
    );
  }
}


/*
subscriber serveice
bond servic3e
token servic3
provider service
*/