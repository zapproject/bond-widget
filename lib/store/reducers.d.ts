import { ZapSubscriber } from '@zapjs/subscriber';
import { ZapProvider } from '@zapjs/provider/lib/src';
import { Curve } from '@zapjs/curve/lib/src';
export declare enum MESSAGE_TYPE {
    LOADIG = "loading",
    ERROR = "error",
    SUCCESS = "success"
}
export declare enum VIEW {
    NONE = 0,
    LOGIN = 1,
    PROVIDER = 2
}
export interface Message {
    type: MESSAGE_TYPE;
    text: string;
}
export interface Widget {
    id: string;
    view: VIEW;
    providerAddress: string;
    endpoint: string;
    message: Message;
    loading: boolean;
    provider: ZapProvider;
    curve: Curve;
    dotsIssued: any;
    endpointMd: string;
    endpointJson: string;
}
export interface UserInfo {
    eth: any;
    zap: any;
    dotsPerEndpoint: {
        widgetID: string;
        dots: any;
    }[];
    subscriber: ZapSubscriber;
}
export interface State {
    web3: any;
    networkId: number;
    accountAddress: string;
    userInfo: UserInfo;
    type: null;
    widgets: Widget[];
    showLogin: boolean;
}
export declare const app: (state: {}, action: any) => {};
