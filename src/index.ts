import Web3 from 'web3'
import { createStore, applyMiddleware, Store, Unsubscribe } from 'redux'
import thunk from 'redux-thunk'
// import { createLogin } from './login';
import { app,  State } from './store/reducers';
// import { createMessage } from './message';
import { setProviderEndpoint, setWeb3, updateAccount, setNetworkId, setAccountAddress } from './store/actions';
import { createProvider, Provider } from './provider';
import './style.css';


interface AppWindow extends Window {
  web3: any;
  ethereum: any;
}
declare const window: AppWindow;

export class ZapBondWidget {
  private containers: HTMLElement[] | HTMLCollection | NodeList;
  private web3: Web3;
  private interval: any;
  private store;
  private state: State;
  private stateUnsubscribe: Unsubscribe;
  private providers: Provider[] = [];

  constructor() {
    this.store = createStore(app, applyMiddleware(thunk));
    this.stateUnsubscribe = this.store.subscribe(() => {
      this.state = this.store.getState();
    })
    this.listenToAccountChanges = this.listenToAccountChanges.bind(this);
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
    return web3;
  }

  /* private getWidgetByID(widgetID) {
    const widgets = this.state.widgets
    let i = widgets.length;
    while (i--) {
      if (widgets[i].id === widgetID) return widgets[i];
    }
    return null;
  } */

  private initWidgets() {
    const ethAddressRe = /^0x[0-9a-fA-F]{40}$/;
    Array.prototype.forEach.call(this.containers, ((container: HTMLElement) => {
      const provider = container.getAttribute('data-address');
      const endpoint = container.getAttribute('data-endpoint');
      try {
        if (!ethAddressRe.test(provider)) throw new Error('Provider address is invalid');
        if (!endpoint) throw new Error('Endpoint is required');
        const widgetID = provider + endpoint;
        this.store.dispatch(setProviderEndpoint(provider, endpoint));
        // createLogin(container, this.store); // Move to the bottom of the body
        this.providers.push(createProvider(container, this.store, provider, endpoint));
      } catch (e) {
        console.log(e);
        container.textContent = e.message;
      }
    }));
  }

  private async listenToAccountChanges() {
    const [netId, accounts] = await Promise.all([
      await this.state.web3.eth.net.getId(),
      await this.state.web3.eth.getAccounts(),
    ]);
    const { networkId, accountAddress } = this.store.getState() as State;
    const address = accounts[0] || null;
    if (networkId === netId && accountAddress === address) return;
    this.store.dispatch(setNetworkId(netId));
    this.store.dispatch(setAccountAddress(address));
    this.store.dispatch(updateAccount(accountAddress, networkId));
  }

  setProvider(provider) {
    this.web3.setProvider(provider);
  }

  destroy() {
    if (this.interval) clearInterval(this.interval);
    if (this.stateUnsubscribe) this.stateUnsubscribe();
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


const widget = new ZapBondWidget();
widget.init('.zap-bond-widget');