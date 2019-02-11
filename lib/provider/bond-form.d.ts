import { Curve } from '@zapjs/curve';
import { ZapSubscriber } from '@zapjs/subscriber';
export declare class BondForm {
    private container;
    private endpoint;
    private providerAddress;
    private widgetID;
    private dispatch;
    private el;
    private bondDotsInput;
    private bondDotsPrice;
    private button;
    private loginPopup;
    private loginButton;
    private _dotsIssued;
    private _curve;
    private _subscriber;
    constructor(container: HTMLElement, endpoint: string, providerAddress: string, widgetID: string, dispatch: any);
    disabled: any;
    dotsIssued: any;
    curve: Curve;
    subscriber: ZapSubscriber;
    private handleShowLogin;
    private handleDotsChange;
    private handleBondDotsSubmit;
    destroy(): void;
}
