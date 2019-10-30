import { Injectable } from '@angular/core';
import { SubscriberModule } from './subscriber-service.module';
import { Observable, from, merge, interval, of, Subject, combineLatest } from 'rxjs';
import { map, shareReplay, switchMap, filter, share, distinctUntilChanged, catchError, withLatestFrom, startWith } from 'rxjs/operators';
import Web3 from 'web3';
import { ZapSubscriber, ZapBondage, ZapRegistry, Types, ZapToken } from 'zapjs';
import { loadSubscriber, getNetworkOptions } from '../shared/utils';

interface AppWindow extends Window {
  web3: any;
  ethereum: any;
}
declare const window: AppWindow;

@Injectable({
  providedIn: SubscriberModule
})
export class SubscriberService {
  public netId$: Observable<number>;
  public web3: Web3;

  public account$: Observable<string>;
  private triggerUpdate = new Subject<{type?: 'CUSTOM_TOKEN'; payload?: any}>();

  public subscriber$: Observable<ZapSubscriber>;
  public balance$: Observable<any>;
  public eth$: Observable<any>;

  public bondage$: Observable<ZapBondage>;
  public registry$: Observable<ZapRegistry>;

  constructor() {
    const trigger$ = this.triggerUpdate.asObservable();

    const interval$ = merge(trigger$.pipe(filter(action => !action)), of(1), interval(5000)).pipe(
      filter(() => !!this.web3),
      share(),
    );
    this.getWeb3().then(web3 => {
      this.web3 = web3;
      this.triggerUpdate.next();
    });

    const customToken$ = trigger$.pipe(
      filter(action => action.type === 'CUSTOM_TOKEN'),
      map(action => action.payload as string),
      startWith(''),
      distinctUntilChanged(),
    );

    this.netId$ = interval$.pipe(
      filter(() => !!this.web3),
      switchMap(() => from(this.web3.eth.net.getId() as Promise<number>)),
      distinctUntilChanged(),
      shareReplay(1),
    );

    this.registry$ = this.netId$.pipe(
      map(networkId => new ZapRegistry(getNetworkOptions(this.web3, networkId)))
    );
    this.bondage$ = this.netId$.pipe(
      map(networkId => new ZapBondage(getNetworkOptions(this.web3, networkId)))
    );

    this.account$ = interval$.pipe(
      switchMap(() => from(this.web3.eth.getAccounts() as string[])),
      map(accounts => accounts && accounts[0] ? accounts[0] : null),
      distinctUntilChanged(),
      shareReplay(1),
    );

    this.eth$ = interval$.pipe(
      switchMap(() => this.account$),
      filter(accountAddress => !!accountAddress),
      switchMap(accountAddress => this.web3.eth.getBalance(accountAddress)),
    );

    this.subscriber$ = combineLatest([
      this.account$,
      this.netId$,
      customToken$,
    ]).pipe(
      map(([accountAddress, netId, customToken]) => {
        if (!accountAddress) return null;
        const subscriber = new ZapSubscriber(accountAddress, getNetworkOptions(this.web3, netId));
        if (customToken) try {
          subscriber.zapToken = new ZapToken({...getNetworkOptions(this.web3, netId), address: customToken});
        } catch (e) {
          console.warn('Invalid custom token address');
        }
        return subscriber;
      }),
      distinctUntilChanged(),
      shareReplay(1),
    );

    this.balance$ = interval$.pipe(
      switchMap(() => this.subscriber$),
      switchMap(subscriber => subscriber ? subscriber.getZapBalance() : of(null)),
    );
  }

  setCustomToken(address: string) {
    const token = this.triggerUpdate.next({type: 'CUSTOM_TOKEN', payload: address});
  }

  getApproved(address?: string): Observable<string | null> {
    return merge(of(1), interval(5000)).pipe(
      switchMap(() => this.subscriber$),
      switchMap(subscriber =>
        subscriber
        ? subscriber.zapToken.contract.methods
          .allowance(subscriber.subscriberOwner, address || subscriber.zapBondage.contract._address)
          .call() as Promise<string>
        : of(null)
      ),
    );
  }

  getBoundDots(provider: string, endpoint: string) {
    const subscriber$ = merge(of(1), interval(5000)).pipe(switchMap(() => this.subscriber$));
    const noop$ = subscriber$.pipe(filter(subscriber => !subscriber), map(() => ""));
    const dots$ = subscriber$.pipe(
      filter(subscriber => !!subscriber && subscriber instanceof ZapSubscriber),
      switchMap(subscriber => subscriber.getBoundDots({provider, endpoint})),
    );
    return merge(noop$, dots$);
  }

  setProvider(provider) {
    this.web3.setProvider(provider);
    this.triggerUpdate.next();
  }

  login() {
    if (!window.ethereum) return;
    window.ethereum.enable().then(() => {
      this.triggerUpdate.next();
    });
  }


  getBroker(provider: string, endpoint: string) {
    return this.registry$.pipe(
      switchMap(registry => {
        return registry.contract.methods
          .getEndpointBroker(provider, this.web3.utils.utf8ToHex(endpoint))
          .call();
      }),
      catchError(e => {
        console.log('getBroker', e);
        return of(Types.NULL_ADDRESS);
      }),
    );
  }

  isToken(provider: string, endpoint: string) {
    return this.getBroker(provider, endpoint).pipe(
      map(address => address !== Types.NULL_ADDRESS),
    );
  }

  private async getWeb3(): Promise<Web3> {
    let web3: Web3;
    try {
      if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        // await window.ethereum.enable();
      } else if (window.web3) {
        web3 = new Web3(window.web3.currentProvider);
      } else {
        web3 = new Web3('wss://kovan.infura.io/ws'); // Kovan by default
      }
      return web3;
    } catch (e) {
      console.log('getWeb3', e);
      return new Web3(window.ethereum || window.web3 || 'wss://kovan.infura.io/ws');
    }
  }
}
