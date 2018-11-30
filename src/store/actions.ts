import { MESSAGE_TYPE, VIEW, State, UserInfo, Widget } from "./reducers";
import { loadSubscriber, loadProvider, getProviderEndpointInfo } from "../utils";

export enum ACTIONS {
  LOGIN,
  SHOW_MESSAGE,
  SET_VIEW,
  ADD_WIDGET,
  UPDATE_WIDGET,
  SET_NETWORK,
  SET_ACCOUNT_ADDRESS,
  SET_WEB3,
  SET_SUBSCIBER,
  SET_USER_INFO,
}

export const setWeb3 = (web3) => ({
  type: ACTIONS.SET_WEB3,
  web3,
});

export const showLogin = () => ({
  type: ACTIONS.LOGIN,
  show: true,
});

export const hideLogin = () => ({
  type: ACTIONS.LOGIN,
  show: false,
});

export const showError = (text: string, widgetID: string) => ({
  type: ACTIONS.SHOW_MESSAGE,
  message: {
    type: MESSAGE_TYPE.ERROR,
    text,
  },
  widgetID,
  loading: false,
});
export const showSuccess = (text: string, widgetID: string) => ({
  type: ACTIONS.SHOW_MESSAGE,
  message: {
    type: MESSAGE_TYPE.SUCCESS,
    text,
  },
  widgetID,
  loading: false,
});
export const showLoading = (text: string, widgetID: string) => ({
  type: ACTIONS.SHOW_MESSAGE,
  message: {
    type: MESSAGE_TYPE.LOADIG,
    text,
  },
  widgetID,
  loading: true,
});
export const hideMessage = (widgetID: string) => ({
  type: ACTIONS.SHOW_MESSAGE,
  message: null,
  widgetID,
  loading: false,
});

export const setView = (view: VIEW, widgetID: string) => ({
  type: ACTIONS.SET_VIEW,
  view,
  widgetID,
});

export const setProviderEndpoint = (providerAddress, endpoint) => ({
  type: ACTIONS.ADD_WIDGET,
  providerAddress,
  endpoint,
});

export const setNetworkId = (networkId) => ({
  type: ACTIONS.SET_NETWORK,
  networkId,
});


export const setUserInfo = (userInfo: UserInfo) => ({
  type: ACTIONS.SET_USER_INFO,
  userInfo,
});

export const setAccountAddress = (accountAddress: string) => ({
  type: ACTIONS.SET_ACCOUNT_ADDRESS,
  accountAddress,
});

export const updateUserInfo = (prevAddress?) => async (dispatch, getState) => {
  const { web3, widgets, accountAddress, userInfo } = getState() as State;
  console.log('accountAddress', accountAddress);
  if (!accountAddress) {
    dispatch(setUserInfo(null))
    return;
  }
  const [subscriber, eth] = await Promise.all([
    (prevAddress && prevAddress !== accountAddress) || !userInfo || !userInfo.subscriber
      ? loadSubscriber(web3, accountAddress)
      : Promise.resolve(userInfo.subscriber),
    web3.eth.getBalance(accountAddress),
  ]);
  const [zap, dotsPerEndpoint]: [any, {widgetID: string; dots: any}[]] = await Promise.all([
    subscriber.getZapBalance(),
    Promise.all(
      widgets.map(widget => subscriber.getBoundDots({provider: widget.providerAddress, endpoint: widget.endpoint})
        .then(dots => ({widgetID: widget.id, dots})))
    ),
  ]);
  dispatch(setUserInfo({subscriber, eth, dotsPerEndpoint, zap}))
}

export const updateWidget = (widgetID: string, prevNetId = null) => async (dispatch, getState) => {
  const { web3, widgets, networkId } = getState() as State;
  const widget = widgets.find(widget => widget.id === widgetID);
  if (!widget) return;
  const provider = ((networkId && networkId !== prevNetId) || !widget.provider) ? await loadProvider(web3, widget.providerAddress) : widget.provider;
  const [endpointInfo, _] = await Promise.all([
    getProviderEndpointInfo(provider, widget.endpoint),
    provider.getTitle(),
  ]);
  const curve = endpointInfo.curve;
  const dotsIssued = endpointInfo.dotsIssued;
  const endpointMd = endpointInfo.endpointMd;
  const endpointJson = endpointInfo.endpointJson;
  dispatch({
    type: ACTIONS.UPDATE_WIDGET,
    widgetID,
    widget: {
      ...widget,
      provider,
      curve,
      dotsIssued,
      endpointMd,
      endpointJson,
    },
  });
}

export const updateAccount = (address = null, netId = null) => async (dispatch, getState) => {
  const { widgets } = getState() as State;
  await Promise.all([
    dispatch(updateUserInfo(address)),
    Promise.all(widgets.map(widget => dispatch(updateWidget(widget.id, netId)))),
  ]);
}
