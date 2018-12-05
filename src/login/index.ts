import HDWalletProvider from 'truffle-hdwallet-provider';
import { networks } from '../utils';
import { MESSAGE_TYPE } from '../store/reducers';
import { MessageElement } from '../shared/message';
import { hideLogin } from '../store/actions';

export class MnemonicLogin {

  private el: HTMLFormElement;
  private button: HTMLButtonElement;
  private select: HTMLSelectElement;
  private input: HTMLInputElement;
  private message: MessageElement;
  private close: HTMLAnchorElement;

  constructor(private container: HTMLElement, private setProvider: (e: any) => void, private dispatch: (e: any) => void) {
    this.el = document.createElement('form');
    this.el.className = 'zap-bond-login';
    this.handleSubmit = this.handleSubmit.bind(this);
    this.el.innerHTML = `
        <label for="zap-bond-mnemonic">Mnemonic phrase</label>
        <input placeholder="Mnemonic" type="text" name="mnemonic" id="zap-bond-mnemonic" required>
        <select placeholder="Network" name="network" required></select>
        <button type="submit">Login</button>
        <a class="close" href="#">&times;</a>
    `;
    this.message = new MessageElement(this.el);
    this.el.addEventListener('submit', this.handleSubmit);
    this.button = this.el.getElementsByTagName('button')[0];
    this.select = this.el.getElementsByTagName('select')[0];
    this.input = this.el.getElementsByTagName('input')[0];
    this.close = this.el.getElementsByTagName('a')[0];
    this.handleClose = this.handleClose.bind(this);
    this.close.addEventListener('click', this.handleClose);
    networks.forEach(network => {
      const option = document.createElement('option');
      option.value = network.url;
      option.textContent = network.name;
      this.select.appendChild(option);
    });
    this.container.appendChild(this.el);
  }

  set disabled(disabled) {
    this.button.disabled = disabled;
    this.input.disabled = disabled;
    this.select.disabled = disabled;
  }

  handleClose(e) {
    e.preventDefault();
    this.dispatch(hideLogin());
  }

  async handleSubmit(e) {
    e.preventDefault();
    this.message.message = null;
    const form = e.target as HTMLFormElement;
    const mnemonic = form.mnemonic.value;
    const network = form.network.value;
    this.message.message = {type: MESSAGE_TYPE.LOADIG, text: 'Loggin in'};
    this.disabled = true;
    try {
      await this.setProvider(new HDWalletProvider(mnemonic, network));
      this.dispatch(hideLogin());
    } catch (e) {
      this.disabled = false;
      this.message.message = {type: MESSAGE_TYPE.ERROR, text: e.message};
    }
  }

  destroy() {
    this.close.removeEventListener('click', this.handleClose);
    this.el.removeEventListener('submit', this.handleSubmit);
    this.container.removeChild(this.el);
  }
}