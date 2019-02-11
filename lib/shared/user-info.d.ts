import { UserInfo } from "../store/reducers";
export declare class UserInfoElement {
    private container;
    private widgetID;
    private el;
    private _address;
    private userAddress;
    private zap;
    private eth;
    private dots;
    constructor(container: HTMLElement, widgetID: string);
    userInfo: UserInfo;
    address: string;
    destroy(): void;
}
