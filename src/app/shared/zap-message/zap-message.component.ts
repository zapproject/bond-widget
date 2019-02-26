import { Component, OnInit, ViewEncapsulation, HostBinding, Input } from '@angular/core';

@Component({
  templateUrl: './zap-message.component.html',
  styleUrls: ['./zap-message.component.css'],
  encapsulation: ViewEncapsulation.Emulated
})
export class ZapMessageComponent implements OnInit {

  @Input() type: string;

  @HostBinding('class')
  get className() {
    if (!this.type) return '';
    return this.type.toLowerCase();
  }

  constructor() { }

  ngOnInit() {
  }

}
