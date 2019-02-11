import { MESSAGE_TYPE, VIEW, UserInfo } from "./reducers";
export declare enum ACTIONS {
    LOGIN = 0,
    SHOW_MESSAGE = 1,
    SET_VIEW = 2,
    ADD_WIDGET = 3,
    UPDATE_WIDGET = 4,
    SET_NETWORK = 5,
    SET_ACCOUNT_ADDRESS = 6,
    SET_WEB3 = 7,
    SET_SUBSCIBER = 8,
    SET_USER_INFO = 9
}
export declare const setWeb3: (web3: any) => {
    type: ACTIONS;
    web3: any;
};
export declare const showLogin: () => {
    type: ACTIONS;
    show: boolean;
};
export declare const hideLogin: () => {
    type: ACTIONS;
    show: boolean;
};
export declare const showError: (text: string, widgetID: string) => {
    type: ACTIONS;
    message: {
        type: MESSAGE_TYPE;
        text: string;
    };
    widgetID: string;
    loading: boolean;
};
export declare const showSuccess: (text: string, widgetID: string) => {
    type: ACTIONS;
    message: {
        type: MESSAGE_TYPE;
        text: string;
    };
    widgetID: string;
    loading: boolean;
};
export declare const showLoading: (text: string, widgetID: string) => {
    type: ACTIONS;
    message: {
        type: MESSAGE_TYPE;
        text: string;
    };
    widgetID: string;
    loading: boolean;
};
export declare const hideMessage: (widgetID: string) => {
    type: ACTIONS;
    message: any;
    widgetID: string;
    loading: boolean;
};
export declare const setView: (view: VIEW, widgetID: string) => {
    type: ACTIONS;
    view: VIEW;
    widgetID: string;
};
export declare const setProviderEndpoint: (providerAddress: any, endpoint: any) => {
    type: ACTIONS;
    providerAddress: any;
    endpoint: any;
};
export declare const setNetworkId: (networkId: any) => {
    type: ACTIONS;
    networkId: any;
};
export declare const setUserInfo: (userInfo: UserInfo) => {
    type: ACTIONS;
    userInfo: UserInfo;
};
export declare const setAccountAddress: (accountAddress: string) => {
    type: ACTIONS;
    accountAddress: string;
};
export declare const updateUserInfo: (prevAddress?: any) => (dispatch: any, getState: any) => Promise<void>;
export declare const updateWidget: (widgetID: string, prevNetId?: any) => (dispatch: any, getState: any) => Promise<void>;
export declare const updateAccount: (address?: any, netId?: any) => (dispatch: any, getState: any) => Promise<void>;
