import { Observable, interval, merge, of } from 'rxjs';
import { switchMap, filter, map } from 'rxjs/operators';
import { ZapSubscriber, Types, TokenDotFactory } from 'zapjs';
import BigNumber from 'bignumber.js';
import { Injectable } from '@angular/core';
import { TokenServiceModule } from './token-service.module';
import { utf8ToHex } from 'web3-utils';
import { SubscriberService } from '../subscriber-service/subscriber.service';

@Injectable({
  providedIn: TokenServiceModule
})
export class BondTokenService {

  subscriber$: Observable<ZapSubscriber>

  constructor(private zap: SubscriberService) {
    this.subscriber$ = zap.subscriber$;
  }


  bond(tokenDotFactory: TokenDotFactory, endpoint: string, dots): Observable<{result: any; error: any}> {
    return this.subscriber$.pipe(
      filter(subscriber => !!subscriber && subscriber instanceof ZapSubscriber),
      switchMap(subscriber => (new Promise((resolve, reject) => {
        tokenDotFactory.contract.methods.bond(utf8ToHex(endpoint), dots).send({
          from: subscriber.subscriberOwner,
          gas: Types.DEFAULT_GAS,
        })
          .on('transactionHash', transactionHash => resolve({transactionHash}))
          .then(resolve)
          .catch(reject)
      }))
        .then(result => ({result, error: null}))
        .catch(error => ({error, result: null}))
      ),
    );
  }

  unbond(tokenDotFactory: TokenDotFactory, endpoint: string, dots): Observable<{result: any; error: any}> {
    return this.subscriber$.pipe(
      filter(subscriber => !!subscriber && subscriber instanceof ZapSubscriber),
      switchMap(subscriber => (new Promise((resolve, reject) => {
        tokenDotFactory.contract.methods.unbond(utf8ToHex(endpoint), dots).send({
          from: subscriber.subscriberOwner,
          gas: Types.DEFAULT_GAS,
        })
          .on('transactionHash', transactionHash => resolve({transactionHash}))
          .then(resolve)
          .catch(reject)
      }))
        .then(result => ({result, error: null}))
        .catch(error => ({error, result: null}))
      ),
    );
  }

  getDotBalance(tokenDotFactory: TokenDotFactory, endpoint: string) {
    const subscriber$ = merge(of(1), interval(5000)).pipe(switchMap(() => this.subscriber$));
    const noop$ = subscriber$.pipe(filter(subscriber => !subscriber), map(() => null));
    const dots$ = subscriber$.pipe(
      filter(subscriber => !!subscriber && subscriber instanceof ZapSubscriber),
      switchMap(subscriber => tokenDotFactory.getDotBalance({specifier: endpoint, from: subscriber.subscriberOwner})),
    );
    return merge(noop$, dots$);
  }

  approve(tokenDotFactory: TokenDotFactory, zap: number): Observable<{result: any; error: any}> {
    const amount = (new BigNumber(zap)).toFixed();
    return this.subscriber$.pipe(
      filter(subscriber => !!subscriber && subscriber instanceof ZapSubscriber),
      switchMap(subscriber => {
        const approve: Promise<any> = subscriber.zapToken.contract.methods.approve(
          tokenDotFactory.contract._address, amount,
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