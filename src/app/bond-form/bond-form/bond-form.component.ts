import {
  Component,
  OnInit,
  ViewEncapsulation,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  Input,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
  AfterViewInit
} from '@angular/core';
import { Curve } from 'zapjs';

@Component({
  templateUrl: './bond-form.component.html',
  styleUrls: ['./bond-form.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class BondFormComponent implements OnChanges, AfterViewInit {

  @Input() curvevalues: string;
  @Input() dotsissued: string;
  @Input() allowance: string;
  @Input() bounddots: string;
  @Input() loading: any;
  @Input() token: any;
  @Input() interface: "standard" | "bond" = "standard";

  @Output() unbond = new EventEmitter<number>();
  @Output() approve = new EventEmitter<number>();
  @Output() tokenApprove = new EventEmitter<number>();
  @Output() bond = new EventEmitter<number>();
  @Output() showLogin = new EventEmitter<void>();

  @ViewChild('input', { static: true }) input: ElementRef<HTMLInputElement>;

  private curve: Curve;
  private approved: number;
  private boundedDots: number;
  private dotsIssued: number;

  private dots = 0;

  canUnbond = true;
  loggedIn = false;
  zapRequired = 0;

  constructor(private cd: ChangeDetectorRef) { }

  ngAfterViewInit() {
    this.updateValues();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.curvevalues && changes.curvevalues.currentValue !== changes.curvevalues.previousValue) {
      try {
        this.curve = new Curve(JSON.parse(changes.curvevalues.currentValue));
        this.updateValues();
      } catch (e) {
        console.log('Zap bond form - Error parse', changes.curvevalues.currentValue);
      }
    }
    if (changes.allowance && changes.allowance.currentValue !== changes.allowance.previousValue) {
      this.loggedIn = !!this.allowance || this.allowance === '0';
      this.approved = Number(changes.allowance.currentValue);
      this.updateValues();
    }
    if (changes.bounddots && changes.bounddots.currentValue !== changes.bounddots.previousValue) {
      this.boundedDots = Number(changes.bounddots.currentValue);
      this.dots = Number(this.input.nativeElement.value);
      this.canUnbond = this.boundedDots >= this.dots;
    }
    if (changes.dotsissued && changes.dotsissued.currentValue !== changes.dotsissued.previousValue) {
      this.dotsIssued = Number(changes.dotsissued.currentValue) || 1;
    }
  }

  get max() {
    return this.curve ? this.curve.max - this.dotsIssued : 100;
  }

  get needApprove() {
    return this.zapRequired > this.approved;
  }

  private updateValues() {
    this.dots = Number(this.input.nativeElement.value);
    if (!this.curve) return;
    this.canUnbond = this.boundedDots >= this.dots;
    try {
      this.zapRequired = this.curve.getZapRequired(this.dotsIssued, this.dots);
      this.cd.detectChanges();
    } catch (e) {
      console.log('getZapRequired', e);
      this.input.nativeElement.value = this.max.toString();
      this.zapRequired = this.curve.getZapRequired(this.dotsIssued, this.max);
      this.cd.detectChanges();
    }
  }

  handleDotsChange() {
    this.updateValues();
  }

  handleUnbond() {
    if (this.dots < 1 || this.dots > this.boundedDots) return;
    this.unbond.emit(this.dots);
  }

  handleApprove() {
    if (this.dots < 1) return;
    this.approve.emit(this.zapRequired);
  }
  handleTokenApprove() {
    if (this.dots < 1) return;
    this.tokenApprove.emit(this.dots);
  }

  handleSubmit(e) {
    e.preventDefault();
    if (this.needApprove) {
      return;
    }
    if (this.dots > 0) {
      this.bond.emit(this.dots);
    }
  }

}
