import Web3 from 'web3';
import { showLoading, showError } from '../store/actions';

interface AppWindow extends Window {
  web3: any;
  ethereum: any;
}
declare const window: AppWindow;

export class MetamaskLogin {

  private el: HTMLFormElement;
  private fieldset: HTMLFieldSetElement;

  constructor(private container: HTMLElement, private onLogin: (e: Web3) => void, private dispatch: (e: any) => void) {
    this.el = document.createElement('form');
    this.el.className = 'metamask-form';
    this.handleSubmit = this.handleSubmit.bind(this);
    this.el.innerHTML = `
      <fieldset>
        <legend>Metamask</legend>
        <button type="submit">Login</button>
        <span>Metamask is not available</span>
      </fieldset>
    `;
    this.fieldset = this.el.getElementsByTagName('fieldset')[0];
    this.el.addEventListener('submit', this.handleSubmit);
    container.appendChild(this.el);
  }

  set disabled(disabled) {
    this.fieldset.disabled = disabled;
  }

  async handleSubmit(e) {
    e.preventDefault();
    try {
      this.dispatch(showLoading('Logging in with metamask'));
      let web3;
      if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        await window.ethereum.enable();
      } else if (window.web3) {
        web3 = new Web3(window.web3.currentProvider);
      } else {
        throw new Error('No web3 provider');
      }
      this.onLogin(web3);
    } catch (e) {
      this.dispatch(showError(e.message));
    }
  }

  destroy() {
    this.el.removeEventListener('submit', this.handleSubmit);
    this.container.removeChild(this.el);
  }
}