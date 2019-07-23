export type TransactionSpeed = 'fastest' | 'fast' | 'average' | 'safeLow';

export function getGasPrice(speed: TransactionSpeed = 'average'): Promise<string> {
	return fetch('https://ethgasstation.info/json/ethgasAPI.json')
		.then(response => response.json())
		.then(json => json[speed] + '000000000') // convert gwei to wei
		.catch(() => '5000000000');
}

export const gas = '500000';
