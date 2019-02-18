import { ZapProvider, Curve, ZapSubscriber } from 'zapjs';
export declare const networks: {
    name: string;
    url: string;
    CHAIN_ID: number;
}[];
export declare function loadAccount(web3: any): Promise<string>;
export declare function loadSubscriber(web3: any, owner: string): Promise<ZapSubscriber>;
export declare function loadProvider(web3: any, networkId: any, owner: string): ZapProvider;
export declare function getProviderParam(provider: ZapProvider, key: string): Promise<string>;
export declare function decodeParam(hex: string): string;
export declare function getUrlText(url: string): Promise<string>;
export declare function formatJSON(json: string, tab?: number): string;
export declare function loadProviderParams(provider: any, endpoint: any): Promise<void | [string, string]>;
export declare function getProviderEndpointInfo(provider: ZapProvider, endpoint: string): Promise<any>;
export declare function checkCurveEqual(curve: Curve, prevCurve: Curve): boolean;
