import Web3 from 'web3';
import { MetamaskLogin } from "./metamask-login";
import { MnemonicLogin } from "./mnemonic-login";
import { loadAccount } from '../utils';
import { showLoading, showError, hideMessage, setView } from '../store/actions';
import { State, VIEW } from '../store/reducers';

interface AppWindow extends Window {
  web3: any;
  ethereum: any;
}
declare const window: AppWindow;

class Login {
  private el: HTMLDivElement;
  private metamaskLoing: MetamaskLogin;
  private mnemonicLoing: MnemonicLogin;

  private _disabled;

  constructor(private container: HTMLElement, private dispatch: (e: any) => void) {
    this.el = document.createElement('div');
    this.el.className = 'login-form';
    this.onLogin = this.onLogin.bind(this);
    if (this.metamaskAvailable) this.metamaskLoing = new MetamaskLogin(this.el, this.onLogin, this.dispatch);
    this.mnemonicLoing = new MnemonicLogin(this.el, this.onLogin, this.dispatch);
    this.container.appendChild(this.el);
  }

  async onLogin(web3: Web3) {
    try {
      this.dispatch(showLoading('Loading acccount'));
      const address = await loadAccount(web3);
      this.dispatch(showLoading('Loading provider'));
      this.dispatch(hideMessage());
      this.dispatch(login({web3, address}));
      this.dispatch(setView(VIEW.PROVIDER));
    } catch (e) {
      console.log(e);
      this.dispatch(showError(e.message));
    }
  }

  get metamaskAvailable() {
    return window.ethereum || window.web3
  }

  set disabled(disabled) {
    if (this._disabled === disabled) return;
    this._disabled = disabled;
    if (this.metamaskLoing) this.metamaskLoing.disabled = disabled;
    this.mnemonicLoing.disabled = disabled;
  }

  destroy() {
    if (this.metamaskLoing) this.metamaskLoing.destroy();
    this.mnemonicLoing.destroy();
    this.container.removeChild(this.el);
  }
}

export function createLogin(container: HTMLElement, store: Store) {
  let prevView = null;
  let login: Login = null;
  return store.subscribe(() => {
    const { view, loading } = (store.getState() as State);
    if (login) login.disabled = loading;
    if (prevView === view) return;
    prevView = view;
    if (login) {
      login.destroy();
      login = null;
    }
    if (view === VIEW.LOGIN) {
      login = new Login(container, store.dispatch);
    }
  });
}