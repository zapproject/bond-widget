import { MESSAGE_TYPE, VIEW } from "./reducers";

export const login = (data: {web3; address: string}) => ({...data, type: null});

export const showError = (text: string) => ({
  type: null,
  message: {
    type: MESSAGE_TYPE.ERROR,
    text,
  },
  loading: false,
});
export const showSuccess = (text: string) => ({
  type: null,
  message: {
    type: MESSAGE_TYPE.SUCCESS,
    text,
  },
  loading: false,
});
export const showLoading = (text: string) => ({
  type: null,
  message: {
    type: MESSAGE_TYPE.LOADIG,
    text,
  },
  loading: true,
});
export const hideMessage = () => ({
  type: null,
  message: null,
  loading: false,
});

export const setView = (view: VIEW) => ({
  type: null,
  view,
});

export const setProviderEndpoint = (providerAddress, endpoint) => ({
  type: null,
  providerAddress,
  endpoint,
});