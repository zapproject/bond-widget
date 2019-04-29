import { Component, ViewEncapsulation, Input, ChangeDetectorRef, OnChanges } from '@angular/core';
import { BondService } from 'src/app/bond-service/bond.service';
import { SubscriberService } from 'src/app/subscriber-service/subscriber.service';
import { ProviderService } from 'src/app/provider-service/provider.service';
import { take } from 'rxjs/operators';

@Component({
  templateUrl: './bond-widget.component.html',
  encapsulation: ViewEncapsulation.Emulated
})
export class BondWidgetComponent implements OnChanges {

  @Input() address: string;
  @Input() endpoint: string;
  @Input() interface: 'standard' | 'bond' = 'standard';

  widgetType: 'TOKEN' | 'PROVIDER';

  constructor(
    public zap: SubscriberService,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnChanges(): void {
    if (!this.endpoint || !this.address) {
      this.widgetType = null;
      setTimeout(() => { this.cd.detectChanges(); });
      return;
    }
    this.zap.isToken(this.address, this.endpoint).pipe(
      take(1),
    ).subscribe(isToken => {
      console.log('isToken', isToken);
      this.widgetType = isToken ? 'TOKEN' : 'PROVIDER';
      setTimeout(() => { this.cd.detectChanges(); });
    }, error => {
      console.log('isToken', error);
      this.widgetType = null;
      setTimeout(() => { this.cd.detectChanges(); });
    });

  }

}
