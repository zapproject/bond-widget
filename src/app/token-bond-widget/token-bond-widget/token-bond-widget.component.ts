import { Component, OnInit, ViewEncapsulation, ChangeDetectorRef, Input } from '@angular/core';
import { filter, map, tap, switchMap, share, withLatestFrom } from 'rxjs/operators';
import { merge, Observable, of, Subject } from 'rxjs';
import { BondTokenService } from 'src/app/token-service/bond-token.service';
import { TokenDotFactory, Artifacts } from 'zapjs';
import { getNetworkOptions } from 'src/app/shared/utils';
import { SubscriberService } from 'src/app/subscriber-service/subscriber.service';
import { ProviderService } from 'src/app/provider-service/provider.service';

@Component({
  templateUrl: './token-bond-widget.component.html',
  styleUrls: ['./token-bond-widget.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class TokenBondWidgetComponent implements OnInit {

  @Input() address: string;
  @Input() endpoint: string;
  @Input() interface: 'standard' | 'bond' = 'standard';

  curveValuesStringified: string;
  title;
  dotsIssued: any;
  zapBalance: any;
  dotsBound: any;
  eth: any;
  accountAddress: any;
  allowance: any = null;
  private action = new Subject<{type: 'BOND' | 'UNBOND' | 'APPROVE' | 'APPROVE_BURN'; payload: number; tokenDotFactory?: TokenDotFactory}>();
  private change = new Subject<void>();

  loading$: Observable<boolean>;
  endpointMd: string;

  subscriptions = [];
  subscription;

  message: {type?: 'ERROR' | 'SUCCESS'; text: string, tx?: any} = null;

  netid;

  tokenDotFactory$: Observable<TokenDotFactory>;

  public viewData = {
    title: '',
    curvevalues: '',
    dotsissued: '',
    allowance: '',
    bounddots: '',
    endpointMd: '',
    tokenAddress:'',
  };

  constructor(
    public zap: SubscriberService,
    private providerService: ProviderService,
    public bond: BondTokenService,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit() {

    this.tokenDotFactory$ = this.zap.netId$.pipe(map(netId => {
      this.netid = netId;
      const tokenDotFactory = new TokenDotFactory(getNetworkOptions(this.zap.web3, netId));
      if (this.address) {
        const artifact = Artifacts['TOKENDOTFACTORY'];
        tokenDotFactory.contract = new this.zap.web3.eth.Contract(artifact.abi, this.address);
      }
      return tokenDotFactory;
    }));

    const change$ = merge(this.change.asObservable(), of(1), this.zap.netId$).pipe(share());

    // const provider$ = change$.pipe(switchMap(() => this.providerService.getProvider(this.address)));
    this.subscription = change$.pipe(
      switchMap(provider => merge(
        this.providerService.getTitle(this.address).pipe(tap(title => { this.viewData.title = title; })),
        this.providerService.getCurve(this.address, this.endpoint).pipe(tap(curve => {
          this.viewData.curvevalues = curve ? JSON.stringify(curve.values) : null;
        })),
        this.tokenDotFactory$.pipe(
          switchMap(tokenDotFactory => this.bond.getTokenAddress(tokenDotFactory, this.endpoint)),
          tap(tokenAddress => {
            this.viewData.tokenAddress = tokenAddress
          }),
        ),
        this.tokenDotFactory$.pipe(
          switchMap(tokenDotFactory => this.bond.getDotBalance(tokenDotFactory, this.endpoint)),
          tap(bounddots => { this.viewData.bounddots = bounddots ? bounddots.toString() : ''; }),
        ),
        this.providerService.getDotsIssued(this.address, this.endpoint).pipe(tap(dotsissued => { this.viewData.dotsissued = dotsissued.toString(); })),
        // this.providerService.getEndpointInfo(provider, this.endpoint).pipe(tap(info => { this.viewData.endpointMd = info.endpointMd; })),
        this.tokenDotFactory$.pipe(
          filter(e => !!e),
          switchMap(tokenDotFactory => this.bond.getApproved(tokenDotFactory, this.endpoint)),
          tap(allowance => { this.viewData.allowance = String(allowance); }),
        ),
      )),
      tap(() => { setTimeout(() => { this.cd.detectChanges(); }); }),
    ).subscribe();

    const action$ = this.action.asObservable().pipe(
      withLatestFrom(this.tokenDotFactory$),
      map(([action, tokenDotFactory]) => {
        action.tokenDotFactory = tokenDotFactory;
        return action;
      }),
      share(),
    );
    const bond$ = action$.pipe(
      filter(({type}) => type === 'BOND'),
      tap(() => { this.handleMessage({text: 'Bonding...'}); }),
      switchMap(({payload, tokenDotFactory}) => this.bond.bond(tokenDotFactory, this.endpoint, payload)),
      share(),
    );
    const unbond$ = action$.pipe(
      filter(({type}) => type === 'UNBOND'),
      tap(() => { this.handleMessage({text: 'Unbonding...'}); }),
      switchMap(({payload, tokenDotFactory}) => this.bond.unbond(tokenDotFactory, this.endpoint, payload)),
      share(),
    );
    const approve$ = action$.pipe(
      filter(({type}) => type === 'APPROVE'),
      tap(() => { this.handleMessage({text: 'Approving...'}); }),
      switchMap(({payload, tokenDotFactory}) => this.bond.approve(tokenDotFactory, payload, this.endpoint)),
      share(),
    );
    const approveBurn$ = action$.pipe(
      filter(({type}) => type === 'APPROVE_BURN'),
      tap(() => { this.handleMessage({text: 'Approving...'}); }),
      switchMap(({payload, tokenDotFactory}) => this.bond.approveBurn(tokenDotFactory, this.endpoint, payload)),
      share(),
    );
    const error$ = merge(bond$, unbond$, approve$, approveBurn$).pipe(
      filter(response => !!response.error),
      map(({error}) => error),
      tap(error => {
        this.handleMessage({text: error.message, type: 'ERROR'});
      }),
    );
    const success$ = merge(bond$, unbond$, approve$, approveBurn$).pipe(
      filter(response => !response.error),
      map(({result}) => result),
      tap((result) => {
        this.change.next();
        this.handleMessage({text: 'Done!', type: 'SUCCESS', tx: result.transactionHash});
      }),
    );
    this.loading$ = merge(
      action$.pipe(map(() => true)),
      error$.pipe(map(() => null)),
      success$.pipe(map(() => null)),
    ).pipe(tap(() => {
      setTimeout(() => { this.cd.detectChanges(); });
    }));
  }

  handleMessage(message) {
    this.message = message;
    this.cd.detectChanges();
  }

  ngOnChanges() {
    if (!this.endpoint) return;
    this.change.next();
  }

  ngOnDestroy() {
    this.change.complete();
    this.action.complete();
    this.subscriptions.forEach( e => e.unsubscribe());
  }

  handleBond(e: CustomEvent) {
    this.action.next({type: 'BOND', payload: e.detail});
  }

  handleUnbond(e: CustomEvent) {
    this.action.next({type: 'UNBOND', payload: e.detail});
  }

  handleApprove(e: CustomEvent) {
    this.action.next({type: 'APPROVE', payload: e.detail});
  }
  handleApproveBurn(e: CustomEvent) {
    this.action.next({type: 'APPROVE_BURN', payload: e.detail});
  }

}
