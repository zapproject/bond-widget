import { Observable, interval, merge, of, from } from 'rxjs';
import { switchMap, filter, map, withLatestFrom } from 'rxjs/operators';
import { ZapSubscriber, Types, TokenDotFactory, Artifacts } from 'zapjs';
import BigNumber from 'bignumber.js';
import { Injectable } from '@angular/core';
import { TokenServiceModule } from './token-service.module';
import { SubscriberService } from '../subscriber-service/subscriber.service';
import { getGasPrice, gas } from '../shared/get-gas-price';

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
        getGasPrice().then(gasPrice => {
          tokenDotFactory.bondTokenDot({
            endpoint,
            dots,
            from: subscriber.subscriberOwner,
            gas,
            gasPrice,
          }, (error, transactionHash) => {
            if (error) {
              reject(error);
            } else {
              resolve({transactionHash});
            }
          }).then(resolve).catch(reject);
        })
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
        getGasPrice().then(gasPrice => {
          tokenDotFactory.unbondTokenDot({
            endpoint,
            dots,
            from: subscriber.subscriberOwner,
            gas,
            gasPrice,
          }, (error, transactionHash) => {
            if (error) {
              reject(error);
            } else {
              resolve({transactionHash});
            }
          }).then(resolve).catch(reject);
        });
      }))
        .then(result => ({result, error: null}))
        .catch(error => ({error, result: null}))
      ),
    );
  }

  getApproved(tokenDotFactory: TokenDotFactory, endpoint: string) {
    const subscriber$ = merge(of(1), interval(5000)).pipe(switchMap(() => this.subscriber$));
    const noop$ = subscriber$.pipe(filter(subscriber => !subscriber), map(() => null));
    const dots$ = subscriber$.pipe(
      filter(subscriber => !!subscriber && subscriber instanceof ZapSubscriber),
      switchMap(subscriber => tokenDotFactory.allowance({endpoint, owner: subscriber.subscriberOwner})),
    );
    return merge(noop$, dots$);
  }

  getDotBalance(tokenDotFactory: TokenDotFactory, endpoint: string) {
    const subscriber$ = merge(of(1), interval(5000)).pipe(switchMap(() => this.subscriber$));
    const noop$ = subscriber$.pipe(filter(subscriber => !subscriber), map(() => null));
    const dots$ = subscriber$.pipe(
      filter(subscriber => !!subscriber && subscriber instanceof ZapSubscriber),
      switchMap(subscriber => tokenDotFactory.getDotTokenBalance({endpoint, from: subscriber.subscriberOwner})),
    );
    return merge(noop$, dots$);
  }

  getTokenAddress(tokenDotFactory:TokenDotFactory, endpoint:string){
    return tokenDotFactory.getDotAddress(endpoint).catch(error => '');
  }

  approve(tokenDotFactory: TokenDotFactory, zap: number, endpoint: string): Observable<{result: any; error: any}> {
    const zapNum = (new BigNumber(zap)).toFixed();
    return this.subscriber$.pipe(
      filter(subscriber => !!subscriber && subscriber instanceof ZapSubscriber),

      switchMap(subscriber => (new Promise((resolve, reject) => {
        getGasPrice().then(gasPrice => {
          tokenDotFactory.approveToBond({
            endpoint,
            zapNum,
            from: subscriber.subscriberOwner,
            gas,
            gasPrice,
          }, (error, transactionHash) => {
            if (error) {
              reject(error);
            } else {
              resolve({transactionHash});
            }
          }).then(resolve).catch(reject);
        });
      }))
        .then(result => ({result, error: null}))
        .catch(error => ({error, result: null}))
      ),
    );
  }

  approveBurn(tokenDotFactory: TokenDotFactory, endpoint: string, dots: number) {

    return this.subscriber$.pipe(
      filter(subscriber => !!subscriber && subscriber instanceof ZapSubscriber),
      switchMap(subscriber => (new Promise((resolve, reject) => {
        getGasPrice().then(gasPrice => {
          tokenDotFactory.approveBurnTokenDot({
            endpoint,
            from: subscriber.subscriberOwner,
            gas,
            gasPrice,
          }, (error, transactionHash) => {
            if (error) {
              reject(error);
            } else {
              resolve({transactionHash});
            }
          }).then(resolve).catch(reject);
        });
      }))
        .then(result => ({result, error: null}))
        .catch(error => ({error, result: null}))
      ),
    );
  }
}