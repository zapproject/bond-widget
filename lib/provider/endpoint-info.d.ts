import { ZapProvider } from '@zapjs/provider';
export declare class EndpointInfo {
    private container;
    private el;
    private endpointTitle;
    private providerTitle;
    private dotsIssued;
    private nextDotPrice;
    private _endpoint;
    private _provider;
    private _dots;
    constructor(container: HTMLElement);
    dots: any;
    provider: ZapProvider;
    endpoint: string;
    destroy(): void;
}
