import Web3 from 'web3';
import './style.css';
declare class ZapBondWidget {
    private containers;
    private interval;
    private store;
    private loginUnsubscribe;
    private providers;
    constructor();
    init(target: string | HTMLElement | HTMLCollection | NodeList): Promise<Web3>;
    private initLogin;
    private initWidgets;
    private listenToAccountChanges;
    setProvider(provider: any): Promise<void>;
    destroy(): void;
    private getWeb3;
}
export declare function initWidget(target: string | HTMLElement | HTMLCollection | NodeList): ZapBondWidget;
export {};
