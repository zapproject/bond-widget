import { utf8ToHex, hexToUtf8 } from 'web3-utils';
import { hexToAddress, isIpfsAddress } from './ipfs-utils';
import { ZapProvider, Curve, ZapSubscriber } from 'zapjs';

export const networks = [
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

export async function loadAccount(web3: any): Promise<string> {
  const accounts: string[] = await web3.eth.getAccounts();
  if ( accounts.length === 0 ) {
    throw new Error('Unable to find an account in the current web3 provider');
  }
  return accounts[0];
}

export async function loadSubscriber(web3: any, owner: string): Promise<ZapSubscriber> {
  const contracts = {
    networkId: (await web3.eth.net.getId()).toString(),
    networkProvider: web3.currentProvider,
  };
  return new ZapSubscriber(owner, contracts);
}

export function loadProvider(web3: any, networkId: any, owner: string): ZapProvider {
  const contracts = {
    networkId,
    networkProvider: web3.currentProvider,
    handler: {
      handleIncoming: (data: string) => {
        console.log('handleIncoming', data);
      },
      handleUnsubscription: (data: string) => {
        console.log('handleUnsubscription', data);
      },
      handleSubscription: (data: string) => {
        console.log('handleSubscription', data);
      },
    },
  };
  return new ZapProvider(owner, contracts);
}

export function getProviderParam(provider: ZapProvider, key: string): Promise<string> {
  return provider.zapRegistry.contract.methods.getProviderParameter(provider.providerOwner, utf8ToHex(key)).call()
    .then(decodeParam)
    .then(url => isIpfsAddress(url) ? 'https://cloudflare-ipfs.com/ipfs/' + url : url)
    .catch(e => { console.log('no provider param', key); } );
}

export function decodeParam(hex: string): string {
  if (hex.indexOf('0x') !== 0) return hex;
  try {
    return hexToUtf8(hex);
  } catch (e) {
    console.log(e);
  }
  try {
    const address = hexToAddress(hex.replace('0x', ''));
    if (isIpfsAddress(address)) return address;
  } catch (e) {
    console.log(e);
  }
  return hex;
}

/* export function getUrlText(url: string): Promise<string> {
  return Promise.race([
    fetch(isIpfsAddress(url) ? 'https://cloudflare-ipfs.com/ipfs/' + url : url),
    new Promise((_, reject) => { setTimeout(() => { reject(new Error('Request timeout.')); }, 2000); }),
  ]).then((response: any) => response.text());
} */

export function formatJSON(json: string, tab = 4): string {
  return JSON.stringify(JSON.parse(json), null, tab);
}

export function loadProviderParams(provider, endpoint) {
  return Promise.all([
    getProviderParam(provider, endpoint + '.md')/* .then(getUrlText) */.catch(e => { console.log(e); return ''; }),
    getProviderParam(provider, endpoint + '.json')/* .then(getUrlText) */.catch(e => { console.log(e); return ''; }),
  ]).catch(console.error);
}

export async function getProviderEndpointInfo(provider: ZapProvider, endpoint: string): Promise<any> {
  const [curve, dotsIssued, zapBound, params] = await Promise.all([
    provider.getCurve(endpoint),
    provider.getDotsIssued(endpoint),
    provider.getZapBound(endpoint),
    loadProviderParams(provider, endpoint),
  ]);
  console.log('params', params);
  if (!curve.values.length) throw new Error('Unable to find the endpoint.');
  return {
    curve,
    dotsIssued,
    zapBound,
    endpointMd: params[0] as string,
    endpointJson: params[1] as string,
  };
}

export function checkCurveEqual(curve: Curve, prevCurve: Curve) {
  if (!curve) return true;
  if (curve && !prevCurve) return false;
  let i = curve.values.length;
  while (i--) {
    if (curve.values[i] !== prevCurve.values[i]) return false;
  }
  return true;
}

export function formatPrice(wei: number): string {
  if (wei >= 1e16) return Math.round(wei / 1e15) / 1e3 + ' ether';
  if (wei >= 1e6) return Math.round(wei / 1e6) / 1e3 + ' gwei';
  return wei + ' wei';
}