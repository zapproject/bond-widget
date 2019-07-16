import { Component, OnInit, ViewEncapsulation, ChangeDetectorRef, Input, OnChanges, OnDestroy } from '@angular/core';
import { SubscriberService } from 'src/app/subscriber-service/subscriber.service';
import { Observable, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
  templateUrl: './zap-user-info.component.html',
  styleUrls: ['./zap-user-info.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ZapUserInfoComponent implements OnInit {

  @Input() approved = "";

  account$: Observable<string>;
  balance$: Observable<string>;
  eth$: Observable<string>;

  constructor(
    private subscriber: SubscriberService,
    private cd: ChangeDetectorRef,
  ) {
    this.detectChanges = this.detectChanges.bind(this);
  }

  ngOnInit() {
    this.account$ = this.subscriber.account$.pipe(tap(this.detectChanges));
    this.balance$ = this.subscriber.balance$.pipe(tap(this.detectChanges));
    this.eth$ = this.subscriber.eth$.pipe(tap(this.detectChanges));
  }

  private detectChanges() {
    setTimeout(() => { this.cd.detectChanges(); });
  }

}
