import { Component, ViewEncapsulation, Input, ChangeDetectorRef, OnChanges, SimpleChanges, AfterViewInit, ElementRef } from '@angular/core';
import { SubscriberService } from 'src/app/subscriber-service/subscriber.service';
import { take } from 'rxjs/operators';
import { ColorThemeName, colorThemes } from 'src/app/color-themes';

@Component({
  templateUrl: './bond-widget.component.html',
  styleUrls: ['./bond-widget.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class BondWidgetComponent implements OnChanges, AfterViewInit {

  @Input() address: string;
  @Input() endpoint: string;
  @Input() token: string;
  @Input() theme: ColorThemeName = 'green';
  @Input() interface: 'standard' | 'bond' = 'standard';

  widgetType: 'TOKEN' | 'PROVIDER';

  constructor(
    public zap: SubscriberService,
    private cd: ChangeDetectorRef,
    private el: ElementRef,
  ) {}

  private updateTheme() {
    if (!this.el) return;
    const theme = colorThemes[this.theme];
    if (!theme) return;
    const body = document.documentElement;
    Object.keys(theme).forEach(k => {
      this.el.nativeElement.style.setProperty(`--${k}`, theme[k]);
    });
  }

  ngAfterViewInit() {
    this.updateTheme();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.theme && (changes.theme.firstChange || changes.theme.currentValue !== changes.theme.previousValue)) {
      this.updateTheme();
    }
    if (changes.token && changes.token.currentValue !== changes.token.previousValue) {
      this.zap.setCustomToken(this.token);
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
