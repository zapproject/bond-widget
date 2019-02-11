import Web3 from 'web3';
import './style.css';
export declare class ZapBondWidget {
    private containers;
    private web3;
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
