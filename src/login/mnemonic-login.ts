import Web3 from 'web3';
import HDWalletProvider from 'truffle-hdwallet-provider';
import { networks } from '../utils';
import { showError, showLoading } from '../store/actions';

export class MnemonicLogin {

  private el: HTMLFormElement;
  private fieldset: HTMLFieldSetElement;

  constructor(private container: HTMLElement, private onLogin: (e: Web3) => void, private dispatch: (e: any) => void) {
    this.el = document.createElement('form');
    this.handleSubmit = this.handleSubmit.bind(this);
    this.el.innerHTML = `
      <fieldset>
        <legend>Login</legend>
        <div class="metamask-login">
          <input placeholder="Mnemonic" type="text" name="mnemonic" id="mnemonic" required="">
          <select name="network" required=""></select>
          <button type="submit">Login</button>
        </div>
      </fieldset>
    `;
    this.el.addEventListener('submit', this.handleSubmit);
    this.fieldset = this.el.getElementsByTagName('fieldset')[0];
    const select = this.el.getElementsByTagName('select')[0];
    networks.forEach(network => {
      const option = document.createElement('option');
      option.value = network.url;
      option.textContent = network.name;
      select.appendChild(option);
    });
    this.container.appendChild(this.el);
  }

  set disabled(disabled) {
    this.fieldset.disabled = disabled;
  }

  async handleSubmit(e) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const mnemonic = form.mnemonic.value;
    const network = form.network.value;
    this.dispatch(showLoading('Logging in with mnemonic'));
    try {
      this.onLogin(new Web3(new HDWalletProvider(mnemonic, network)));
    } catch (e) {
      this.dispatch(showError(e.message));
    }
  }

  destroy() {
    this.el.removeEventListener('submit', this.handleSubmit);
    this.container.removeChild(this.el);
  }
}