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

export function getNetworkOptions(web3: any, networkId: any) {
  return {
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
}

export function loadProvider(web3: any, networkId: any, owner: string): ZapProvider {
  const options = getNetworkOptions(web3, networkId);
  console.log('loadProvider', options, networkId, owner);
  return new ZapProvider(owner, options);
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

export function loadProviderParams(provider: ZapProvider, endpoint: string): Promise<void | string[]> {
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
  if (wei >= 1e16) return Math.round(wei / 1e15) / 1e3 + '';
  if (wei >= 1e6) return Math.round(wei / 1e6) / 1e3 + ' gwei';
  return wei + ' wei';
}

function splitCurveToTurms(curve: number[]): number[][] {
	if (curve.length <= 0) return [];
	const res = [];
	let startIndex = 0;
	let currentLength = curve[0];
	let endIndex = currentLength + 2;
	while (startIndex < curve.length) {
		res.push(curve.slice(startIndex, endIndex));
		startIndex += currentLength + 2;
		currentLength = curve[endIndex];
		endIndex = startIndex + currentLength + 2;
	}
	return res;
}
export function termToString(term: number[]): string {
	const limit = term[term.length - 1];
	const parts = [];
	for (let i = 1; i <= term[0]; i++) {
		if (term[i] === 0) continue;
		if (term[i] === 1) {
			parts.push('x^' + (i - 1));
		} else {
			parts.push(term[i] + '*' + 'x^' + (i - 1));
		}
	}
	return parts.join('+') + '; limit = ' + limit;
}
export function curveToString(values: number[]): string {
	return splitCurveToTurms(values).map(term => termToString(term)).join(' & ');
}
