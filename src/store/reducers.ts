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

export interface State {
  web3: any;
  address: string;
  message: Message;
  loading: boolean;
  type: null;
  view: VIEW;
  providerAddress: string;
  endpoint: string;
}

const initState: State = {
  web3: null,
  address: null,
  message: null,
  loading: null,
  type: null,
  view: null,
  providerAddress: null,
  endpoint: null,
};

export const app = (state: State = initState, action = null) => {
  if (!action) return state;
  return {...state, ...action};
}