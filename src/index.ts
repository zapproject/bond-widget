import Web3 from 'web3'
import { app,  State } from './store/reducers';
import { setProviderEndpoint, setWeb3, updateAccount } from './store/actions';
import { Provider } from './provider';
import './style.css';
import { Store, select } from './store';
import { MnemonicLogin } from './login';

interface AppWindow extends Window {
  web3: any;
  ethereum: any;
}
declare const window: AppWindow;

export class ZapBondWidget {
  private containers: HTMLElement[] | HTMLCollection | NodeList;
  private interval: any;
  private store;
  private loginUnsubscribe;
  private providers: Provider[] = [];

  constructor() {
    this.store = new Store(app);
    this.listenToAccountChanges = this.listenToAccountChanges.bind(this);
    this.setProvider = this.setProvider.bind(this);
  }

  async init(target: string | HTMLElement | HTMLCollection | NodeList): Promise<Web3> {
    if (target instanceof HTMLElement) {
      this.containers = [target];
    } else if (typeof target === 'string') {
      this.containers = document.querySelectorAll(target);
    } else if (target.length) {
      this.containers = target;
    } else {
      throw new Error('Target must be correct selector, HTMLElement, HTMLCollection, NodeList');
    }
    const web3 = await this.getWeb3();
    this.store.dispatch(setWeb3(web3));
    this.listenToAccountChanges();
    this.interval = setInterval(this.listenToAccountChanges, 5000);
    this.initWidgets();
    this.initLogin();
    return web3;
  }

  private initLogin() {
    let login: MnemonicLogin;
    this.loginUnsubscribe = this.store.subscribe(select((state: State) => state.showLogin, show => {
      if (!show && login) login.destroy();
      else if (show) login = new MnemonicLogin(document.getElementsByTagName('body')[0], this.setProvider, this.store.dispatch);
    }, this.store.getState()));
  }

  private initWidgets() {
    const ethAddressRe = /^0x[0-9a-fA-F]{40}$/;
    Array.prototype.forEach.call(this.containers, ((container: HTMLElement) => {
      const provider = container.getAttribute('data-address');
      const endpoint = container.getAttribute('data-endpoint');
      try {
        if (!ethAddressRe.test(provider)) throw new Error('Provider address is invalid');
        if (!endpoint) throw new Error('Endpoint is required');
        this.store.dispatch(setProviderEndpoint(provider, endpoint));
        this.providers.push(new Provider(container, provider, endpoint, this.store));
      } catch (e) {
        console.log(e);
        container.textContent = e.message;
      }
    }));
  }

  private async listenToAccountChanges() {
    const [netId, accounts] = await Promise.all([
      await this.store.getState().web3.eth.net.getId(),
      await this.store.getState().web3.eth.getAccounts(),
    ]);
    const { networkId, accountAddress } = this.store.getState() as State;
    const address = accounts[0] || null;
    if (networkId === netId && accountAddress === address) return;
    this.store.dispatch(updateAccount(address, netId));
  }

  setProvider(provider) {
    this.store.getState().web3.setProvider(provider);
    return this.listenToAccountChanges();
  }

  destroy() {
    if (this.interval) clearInterval(this.interval);
    this.loginUnsubscribe();
    this.providers.forEach(provider => { provider.destroy(); });
  }

  private async getWeb3() {
    let web3: Web3;
    try {
      if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        // await window.ethereum.enable();
      } else if (window.web3) {
        web3 = new Web3(window.web3.currentProvider);
      } else {
        web3 = new Web3('wss://kovan.infura.io/ws'); // Kovan by default
      }
      return web3;
    } catch(e) {
      console.log(e);
      return new Web3(window.ethereum || window.web3 || 'wss://kovan.infura.io/ws');
    }
  }
}