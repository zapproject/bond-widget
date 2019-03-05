import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';

@Component({
  templateUrl: './transaction-info.component.html',
  styleUrls: ['./transaction-info.component.css'],
  encapsulation: ViewEncapsulation.Emulated
})
export class TransactionInfoComponent implements OnInit {

  @Input() netid;
  @Input() tx;

  constructor() { }

  ngOnInit() {
  }

  get href() {
    const netId = Number(this.netid);
    switch (netId) {
      case 1:
        return 'https://etherscan.io/tx/' + this.tx;
      case 42:
        return 'https://kovan.etherscan.io/tx/' + this.tx;
      default:
        return '#';
    }
  }

}
