import { Injectable } from '@angular/core';
import { SharedModule } from './shared.module';
import { Observable, from, merge, interval, of, Subject } from 'rxjs';
import { map, shareReplay, switchMap, filter, startWith, share, tap, distinctUntilChanged, take } from 'rxjs/operators';
import Web3 from 'web3';
import { loadProvider, getProviderEndpointInfo, loadSubscriber } from './utils';
import { ZapSubscriber, Types } from 'zapjs';

interface AppWindow extends Window {
  web3: any;
  ethereum: any;
}
declare const window: AppWindow;

@Injectable({
  providedIn: SharedModule
})
export class ZapService {

  private netId$: Observable<number>;
  private web3: Web3;

  public account$: Observable<string>;
  // public userInfo$: Observable<{ subscriber: ZapSubscriber; eth: any; zap: any; allowance: any; }>;
  private triggerUpdate = new Subject<void>();

  private login: HTMLElement;

  public allowance$: Observable<any>;
  public subscriber$: Observable<ZapSubscriber>;
  public balance$: Observable<any>;
  public eth$: Observable<any>;

  constructor() {
    const trigger$ = this.triggerUpdate.asObservable();
    this.hideLogin = this.hideLogin.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
    const interal$ = merge(trigger$, of(1), interval(5000)).pipe(share());
    this.web3 = this.getWeb3();

    this.netId$ = interal$.pipe(
      switchMap(() => from(this.web3.eth.net.getId() as Promise<number>)),
      distinctUntilChanged(),
      shareReplay(1),
    );

    this.account$ = interal$.pipe(
      switchMap(() => from(this.web3.eth.getAccounts())),
      map(accounts => accounts && accounts[0] ? accounts[0] : null),
      distinctUntilChanged(),
      shareReplay(1),
    );

    this.eth$ = interal$.pipe(
      switchMap(() => this.account$),
      filter(accountAddress => !!accountAddress),
      switchMap(accountAddress => this.web3.eth.getBalance(accountAddress)),
    );

    this.subscriber$ = this.account$.pipe(
      switchMap(accountAddress => loadSubscriber(this.web3, accountAddress)),
      shareReplay(1),
    );

    this.balance$ = interal$.pipe(
      switchMap(() => this.subscriber$),
      switchMap(subscriber => subscriber.getZapBalance()),
    ),

    this.allowance$ = interal$.pipe(
      switchMap(() => this.subscriber$),
      switchMap(subscriber =>
        subscriber.zapToken.contract.methods.allowance(subscriber.subscriberOwner, subscriber.zapBondage.contract._address).call()
      ),
    );
  }

  getBoundDots(provider, endpoint) {
    const subscriber$ = merge(of(1), interval(5000)).pipe(switchMap(() => this.subscriber$));
    const noop$ = subscriber$.pipe(filter(subscriber => !subscriber), map(() => null));
    const dots$ = subscriber$.pipe(
      filter(subscriber => !!subscriber && subscriber instanceof ZapSubscriber),
      switchMap(subscriber => subscriber.getBoundDots({provider, endpoint})),
    );
    return merge(noop$, dots$);
  }

  getWidgetInfo(address: string, endpoint: string) {
    return this.netId$.pipe(
      map(netId => loadProvider(this.web3, netId, address)),
      switchMap(provider => from(
        Promise.all([getProviderEndpointInfo(provider, endpoint), provider.getTitle().then(() => provider)])
      )),
      map(([endpointInfo, provider]) => {
        const curve = endpointInfo.curve;
        const dotsIssued = endpointInfo.dotsIssued;
        const endpointMd = endpointInfo.endpointMd;
        const endpointJson = endpointInfo.endpointJson;
        return {
          provider,
          curve,
          dotsIssued,
          endpointMd,
          endpointJson,
        };
      }),
    );
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
          subscriber.zapBondage.contract._address, zap.toString()
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

  showLogin() {
    this.login = document.body.appendChild(document.createElement('zap-login'));
    this.login.addEventListener('login', this.handleLogin);
    this.login.addEventListener('close', this.hideLogin);
  }

  hideLogin() {
    this.login.removeEventListener('login', this.handleLogin);
    this.login.removeEventListener('close', this.handleLogin);
    this.login.parentElement.removeChild(this.login);
    this.login = null;
  }

  handleLogin(event: CustomEvent) {
    this.account$.pipe(
      filter(e => !!e),
      take(1),
    ).subscribe(() => {
      this.hideLogin();
    });
    this.setProvider(event.detail);
  }

  setProvider(provider) {
    this.web3.setProvider(provider);
    this.triggerUpdate.next();
  }

  private getWeb3(): Web3 {
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
      console.log(e);
      return new Web3(window.ethereum || window.web3 || 'wss://kovan.infura.io/ws');
    }
  }


}

