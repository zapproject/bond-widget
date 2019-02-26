import { Component, ViewEncapsulation, Input, OnChanges, ChangeDetectorRef, OnDestroy, OnInit } from '@angular/core';
import { ZapService } from 'src/app/shared/zap.service';
import { filter, take, switchMap, share, map, shareReplay, tap,  } from 'rxjs/operators';
import { Subject, merge, of, Observable } from 'rxjs';

@Component({
  templateUrl: './bond-widget.component.html',
  styleUrls: ['./bond-widget.component.css'],
  encapsulation: ViewEncapsulation.Emulated
})
export class BondWidgetComponent implements OnInit, OnChanges, OnDestroy {

  @Input() address: string;
  @Input() endpoint: string;

  curveValuesStringified: string;
  dotsIssued: any;
  title;
  dotsBound: any;
  allowance: any = null;
  private action = new Subject<{type: 'BOND' | 'UNBOND' | 'APPROVE', payload: number}>();
  private change = new Subject<{address: string; endpoint: string}>();
  change$ = this.change.asObservable().pipe(shareReplay(1));

  loading$: Observable<boolean>;
  endpointMd: string;

  userInfo = null;

  subscriptions = [];

  message: {type?: 'ERROR' | 'SUCCESS'; text: string} = null;

  constructor(
    public zap: ZapService,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    const change$ = merge(this.change$, of({endpoint: this.endpoint, address: this.address}));
    this.subscriptions.push(change$.pipe(switchMap(e => this.zap.getBoundDots(e.address, e.endpoint))).subscribe(dots => {
      this.dotsBound = dots;
      this.cd.detectChanges();
    }));
    this.subscriptions.push(change$.pipe(switchMap(e => this.zap.getAllowance())).subscribe(allowance => {
      this.allowance = allowance;
      this.cd.detectChanges();
    }));

    this.subscriptions.push(this.zap.userInfo$.subscribe(userInfo => {
      if (!userInfo) {
        this.userInfo = null;
        this.cd.detectChanges();
        return;
      }
      this.userInfo = {
        zap: userInfo.zap,
        eth: userInfo.eth,
        approved: userInfo.allowance,
        address: userInfo.subscriber.subscriberOwner,
      };
      this.cd.detectChanges();
    }));

    const action$ = this.action.asObservable().pipe(
      share(),
    );
    const bond$ = action$.pipe(
      filter(({type}) => type === 'BOND'),
      tap(() => { this.handleMessage({text: 'Bonding...'}); }),
      switchMap(({payload}) => this.zap.bond(this.address, this.endpoint, payload)),
      share(),
    );
    const unbond$ = action$.pipe(
      filter(({type}) => type === 'UNBOND'),
      tap(() => { this.handleMessage({text: 'Unbonding...'}); }),
      switchMap(({payload}) => this.zap.unbond(this.address, this.endpoint, payload)),
      share(),
    );
    const approve$ = action$.pipe(
      filter(({type}) => type === 'APPROVE'),
      tap(() => { this.handleMessage({text: 'Approving...'}); }),
      switchMap(({payload}) => this.zap.approve(payload)),
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
      tap(() => { this.handleMessage({text: 'Done!', type: 'SUCCESS'}); }),
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
    this.zap.getWidgetInfo(this.address, this.endpoint).pipe(
      filter(e => !!e),
      take(1),
    ).subscribe(widget => {
      this.curveValuesStringified = JSON.stringify(widget.curve.values);
      this.dotsIssued = widget.dotsIssued;
      this.title = widget.provider.title;
      this.endpointMd = widget.endpointMd;
      this.cd.detectChanges();
    });
    this.change.next({address: this.address, endpoint: this.endpoint});
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
}

