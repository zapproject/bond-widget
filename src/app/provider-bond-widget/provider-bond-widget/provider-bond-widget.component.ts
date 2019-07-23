import { Component, ViewEncapsulation, Input, OnChanges, ChangeDetectorRef, OnDestroy, OnInit } from '@angular/core';
import { filter, switchMap, share, map, shareReplay, tap } from 'rxjs/operators';
import { Subject, merge, of, Observable, Subscription } from 'rxjs';
import { BondService } from 'src/app/bond-service/bond.service';
import { SubscriberService } from 'src/app/subscriber-service/subscriber.service';
import { ProviderService } from 'src/app/provider-service/provider.service';

@Component({
  templateUrl: './provider-bond-widget.component.html',
  styleUrls: ['./provider-bond-widget.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class PorviderBondWidgetComponent implements OnInit, OnChanges, OnDestroy {

  @Input() address: string;
  @Input() endpoint: string;
  @Input() interface: 'standard' | 'bond' = 'standard';

  private action = new Subject<{type: 'BOND' | 'UNBOND' | 'APPROVE', payload: number}>();
  private change = new Subject<void>();
  private change$ = this.change.asObservable().pipe(shareReplay(1));

  loading$: Observable<boolean>;
  subscription: Subscription;
  message: {type?: 'ERROR' | 'SUCCESS'; text: string, tx?: any} = null;
  netid$ = this.zap.netId$;

  public viewData = {
    title: '',
    curvevalues: '',
    dotsissued: '',
    allowance: '',
    bounddots: '',
    endpointMd: '',
  };

  constructor(
    public zap: SubscriberService,
    public providerService: ProviderService,
    public bond: BondService,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    const change$ = merge(this.change$, of(1));

    // const provider$ = change$.pipe(switchMap(() => this.providerService.getProvider(this.address)));
    this.subscription = change$.pipe(
      switchMap(provider => merge(
        this.providerService.getTitle(this.address).pipe(tap(title => { this.viewData.title = title; })),
        this.providerService.getCurve(this.address, this.endpoint).pipe(tap(curve => {
          this.viewData.curvevalues = curve ? JSON.stringify(curve.values) : null;
        })),
        this.zap.getBoundDots(this.address, this.endpoint).pipe(tap(bounddots => { this.viewData.bounddots = bounddots.toString(); })),
        this.providerService.getDotsIssued(this.address, this.endpoint).pipe(
          tap(dotsissued => { this.viewData.dotsissued = dotsissued.toString(); })
        ),
        // this.providerService.getEndpointInfo(provider, this.endpoint).pipe(tap(info => { this.viewData.endpointMd = info.endpointMd; })),
        this.zap.getApproved().pipe(tap(allowance => { this.viewData.allowance = allowance; }))
      )),
      tap(() => { setTimeout(() => { this.cd.detectChanges(); }); }),
    ).subscribe();

    const action$ = this.action.asObservable().pipe(
      share(),
    );
    const bond$ = action$.pipe(
      filter(({type}) => type === 'BOND'),
      tap(() => { this.handleMessage({text: 'Bonding...'}); }),
      switchMap(({payload}) => this.bond.bond(this.address, this.endpoint, payload)),
      share(),
    );
    const unbond$ = action$.pipe(
      filter(({type}) => type === 'UNBOND'),
      tap(() => { this.handleMessage({text: 'Unbonding...'}); }),
      switchMap(({payload}) => this.bond.unbond(this.address, this.endpoint, payload)),
      share(),
    );
    const approve$ = action$.pipe(
      filter(({type}) => type === 'APPROVE'),
      tap(() => { this.handleMessage({text: 'Approving...'}); }),
      switchMap(({payload}) => this.bond.approve(payload)),
      share(),
    );
    const error$ = merge(bond$, unbond$, approve$).pipe(
      filter(response => !!response.error),
      map(({error}) => error),
      tap(error => {
        this.handleMessage({text: error.message, type: 'ERROR'});
      }),
    );
    const success$ = merge(bond$, unbond$, approve$).pipe(
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
    if (!this.address || !this.endpoint) return;
    this.change.next();
  }

  ngOnDestroy() {
    this.change.complete();
    this.action.complete();
    if (this.subscription) this.subscription.unsubscribe();
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
}

