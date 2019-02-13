import { ACTIONS } from './actions';
import { ZapSubscriber } from '@zapjs/subscriber';
import { ZapProvider } from '@zapjs/provider/lib/src';
import { Curve } from '@zapjs/curve/lib/src';
import { combineReducers } from './index';

export enum MESSAGE_TYPE {
  LOADIG = 'loading',
  ERROR = 'error',
  SUCCESS = 'success',
};

export enum VIEW {
  NONE,
  LOGIN,
  PROVIDER,
}

export interface Message {
  type: MESSAGE_TYPE;
  text: string;
}
export interface Widget {
  id: string; // concat provider address and endpoint name
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

const getNewWidget = (providerAddress, endpoint): Widget => ({
  providerAddress,
  endpoint,
  loading: false,
  message: null,
  id: providerAddress + endpoint,
  view: VIEW.PROVIDER,
  provider: null,
  curve: null,
  dotsIssued: null,
  endpointJson: '',
  endpointMd: '',
});

const widgets = (state: Widget[] = [], action) => {
  switch (action.type) {
    case ACTIONS.ADD_WIDGET:
      const newId = action.providerAddress + action.endpoint;
      if (state.filter(widget => widget.id === newId).length) return state;
      state.push(getNewWidget(action.providerAddress, action.endpoint));
      return state;
    case ACTIONS.UPDATE_WIDGET:
      return state.map(widget => widget.id === action.widgetID ? action.widget : widget);
    case ACTIONS.SHOW_MESSAGE:
      return state.map(widget => widget.id === action.widgetID ? {...widget, message: action.message} : widget);
    default:
      return state;
  }
}

export interface UserInfo {
  eth: any;
  zap: any;
  allowance: any;
  dotsPerEndpoint: {widgetID: string; dots: any}[];
  subscriber: ZapSubscriber,
}
const userInfo = (state: UserInfo = null, action) => {
  if (action.type !== ACTIONS.SET_USER_INFO) return state;
  return action.userInfo;
}

const accountAddress = (state: string = null, action) => {
  if (action.type !== ACTIONS.SET_ACCOUNT_ADDRESS) return state;
  return action.accountAddress;
}

const networkId = (state: number = null, action) => {
  if (action.type !== ACTIONS.SET_NETWORK) return state;
  return action.networkId;
}

const web3 = (state = null, action) => {
  if (action.type !== ACTIONS.SET_WEB3) return state;
  return action.web3;
}

const showLogin = (state = false, action) => {
  if (action.type !== ACTIONS.LOGIN) return state;
  return action.show;
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
export const app = combineReducers({
  web3,
  networkId,
  accountAddress,
  userInfo,
  widgets,
  showLogin,
});