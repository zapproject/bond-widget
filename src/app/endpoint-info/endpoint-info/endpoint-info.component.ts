import { Component, OnInit, ViewEncapsulation, Input, OnDestroy, OnChanges, ChangeDetectorRef } from '@angular/core';
import { switchMap, map, share, tap, filter } from 'rxjs/operators';
import { of, Subject, merge, Observable } from 'rxjs';
import { ProviderService } from 'src/app/provider-service/provider.service';

@Component({
  templateUrl: './endpoint-info.component.html',
  styleUrls: ['./endpoint-info.component.css'],
  encapsulation: ViewEncapsulation.Emulated
})
export class EndpointInfoComponent implements OnInit, OnDestroy, OnChanges {

  @Input() address: string;
  @Input() endpoint: string;
  @Input() bounddots: string;
  @Input() tokenaddress: string;

  title$: Observable<string>;
  dotsissued$: Observable<string>;

  data$: Observable<{title: string; dotsissued: string}>;

  private change = new Subject<void>();

  constructor(private providerService: ProviderService, private cd: ChangeDetectorRef) {
    this.updateChanges = this.updateChanges.bind(this);
  }

  ngOnInit() {
    const change$ = merge(this.change.asObservable(), of(1));
    // const provider$ = change$.pipe(switchMap(() => this.providerService.getProvider(this.address)), share());

    this.title$ = change$.pipe(
      switchMap(provider => this.providerService.getTitle(this.address)),
      tap(this.updateChanges),
    );
    this.dotsissued$ = change$.pipe(
      switchMap(provider => this.providerService.getDotsIssued(this.address, this.endpoint)),
      map(e => e.toString()),
      tap(this.updateChanges),
    );
  }

  updateChanges() {
    setTimeout(() => {
      this.cd.detectChanges();
    });
  }

  ngOnChanges() {
    if (!this.address || !this.endpoint) return;
    this.change.next();
  }

  ngOnDestroy() {
    this.change.complete();
  }

}
