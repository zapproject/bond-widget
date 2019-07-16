import { Component, ViewEncapsulation, Input, ChangeDetectorRef, OnChanges, SimpleChanges } from '@angular/core';
import { SubscriberService } from 'src/app/subscriber-service/subscriber.service';
import { take } from 'rxjs/operators';
import { ColorThemeName, colorThemes } from 'src/app/color-themes';

@Component({
  templateUrl: './bond-widget.component.html',
  styleUrls: ['./bond-widget.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class BondWidgetComponent implements OnChanges {

  @Input() address: string;
  @Input() endpoint: string;
  @Input() theme: ColorThemeName = 'green';
  @Input() interface: 'standard' | 'bond' = 'standard';

  widgetType: 'TOKEN' | 'PROVIDER';

  constructor(
    public zap: SubscriberService,
    private cd: ChangeDetectorRef,
  ) {}

  private updateTheme() {
    const theme = colorThemes[this.theme];
    if (!theme) return;
    const body = document.documentElement;
    Object.keys(theme).forEach(k =>
      document.documentElement.style.setProperty(`--${k}`, theme[k])
    );
  }

  ngOnChanges(chages: SimpleChanges): void {
    if (chages.theme.firstChange || chages.theme.currentValue !== chages.theme.previousValue) {
      this.updateTheme();
    }
    if (!this.endpoint || !this.address) {
      this.widgetType = null;
      setTimeout(() => { this.cd.detectChanges(); });
      return;
    }
    this.zap.isToken(this.address, this.endpoint).pipe(
      take(1),
    ).subscribe(isToken => {
      this.widgetType = isToken ? 'TOKEN' : 'PROVIDER';
      setTimeout(() => { this.cd.detectChanges(); });
    }, error => {
      this.widgetType = null;
      setTimeout(() => { this.cd.detectChanges(); });
    });

  }

}
