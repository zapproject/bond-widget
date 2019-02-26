import { Component, OnInit, ViewEncapsulation, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import HDWalletProvider from 'truffle-hdwallet-provider';

@Component({
  templateUrl: './zap-login.component.html',
  styleUrls: ['./zap-login.component.css'],
  encapsulation: ViewEncapsulation.Emulated
})
export class ZapLoginComponent implements OnInit {

  @Output() login = new EventEmitter<any>();
  @Output() close = new EventEmitter<any>();

  message = null;

  disabled = false;

  networks = [
    {
      name: 'Kovan Test Network',
      url: 'wss://kovan.infura.io/ws',
      CHAIN_ID: 42,
    },
    {
      name: 'Main Ethereum Network',
      url: 'wss://mainnet.infura.io/ws',
      CHAIN_ID: 1,
    },
    {
      name: 'Localhost 8546',
      url: 'ws://localhost:8546',
      CHAIN_ID: 1337,
    }
  ];

  constructor(private cd: ChangeDetectorRef) { }

  ngOnInit() {
  }

  handleLogin(e) {
    e.preventDefault();
    this.message = 'Loggin in...';
    const form = e.target as HTMLFormElement;
    const mnemonic = form.mnemonic.value;
    const network = form.network.value;
    // this.message.message = {type: MESSAGE_TYPE.LOADIG, text: 'Loggin in'};
    this.disabled = true;
    this.cd.detectChanges();
    try {
      const provider = new HDWalletProvider(mnemonic, network);
      this.login.emit(provider);
    } catch (e) {
      this.disabled = false;
      // this.message.message = {type: MESSAGE_TYPE.ERROR, text: e.message};
    }
  }
}
