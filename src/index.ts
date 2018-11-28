import { createStore } from 'redux'
import { createLogin } from './login';
import { app, VIEW } from './store/reducers';
import { createMessage } from './message';
import { setView, setProviderEndpoint, showError } from './store/actions';
import { createProvider } from './provider';

const store = createStore(app);

const container = document.getElementById('app');
const provider = container.getAttribute('data-address');
const endpoint = container.getAttribute('data-endpoint');

createMessage(container, store);

const ethAddressRe = /^0x[0-9a-fA-F]{40}$/;

try {
  if (!ethAddressRe.test(provider)) throw new Error('Provider address is invalid');
  if (!endpoint) throw new Error('Endpoint is required');
  store.dispatch(setProviderEndpoint(provider, endpoint));
  createLogin(container, store);
  createProvider(container, store);
  store.dispatch(setView(VIEW.LOGIN));
} catch (e) {
  console.log(e);
  store.dispatch(showError(e.message));
}

