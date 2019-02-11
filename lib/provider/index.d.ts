import { Widget, UserInfo } from "../store/reducers";
export declare class Provider {
    private container;
    private providerAddress;
    private endpoint;
    private store;
    unsubscribe: any[];
    private el;
    private _widget;
    private _userInfo;
    private bondForm;
    private chart;
    private endpointInfo;
    private endpointMarkdown;
    private message;
    private userInfoElement;
    private widgetID;
    constructor(container: HTMLElement, providerAddress: any, endpoint: any, store: any);
    private readonly loading;
    updateWidget(widget: Widget): void;
    updateUserInfo(userInfo: UserInfo): void;
    destroy(): void;
}
