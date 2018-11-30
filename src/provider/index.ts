import { State, VIEW, Widget, UserInfo, MESSAGE_TYPE } from "../store/reducers";
import { Unsubscribe, Store } from "redux";
import { Chart } from './chart';
import { BondForm } from './bond-form';
import { EndpointInfo } from './endpoint-info';
import { EndpointMarkdown } from './endpoint-markdown';
import { MessageElement } from '../shared/message';
import { UserInfoElement } from '../shared/user-info';

export class Provider {

  unsubscribe: Unsubscribe;

  private el: HTMLDivElement;

  private _widget: Widget = null;
  private _userInfo: UserInfo = null;

  private bondForm: BondForm;
  private chart: Chart;
  private endpointInfo: EndpointInfo;
  private endpointMarkdown: EndpointMarkdown;
  private message: MessageElement;
  private userInfoElement: UserInfoElement;

  constructor(
    private container: HTMLElement,
    private endpoint,
    private providerAddress,
    private widgetID,
    private dispatch: (e: any) => void,
  ) {
    this.el = document.createElement('div');
    this.el.className = 'provider';

    this.message = new MessageElement(this.el);
    this.userInfoElement = new UserInfoElement(this.el, this.widgetID);
    this.endpointInfo = new EndpointInfo(this.el);
    this.bondForm = new BondForm(this.el, this.endpoint, this.providerAddress, this.widgetID, this.dispatch);
    this.chart = new Chart(this.el);
    this.endpointMarkdown = new EndpointMarkdown(this.el);

    container.appendChild(this.el);
  }

  private get loading() {
    return this._widget.message && this._widget.message.type === MESSAGE_TYPE.LOADIG;
  }

  set widget(widget: Widget) {
    if (this._widget === widget) return;
    this._widget = widget;
    if (!this._widget) return;
    this.chart.curve = this._widget.curve;
    this.chart.dotsIssued = this._widget.dotsIssued;
    this.endpointInfo.dots = this._widget.dotsIssued;
    this.endpointInfo.endpoint = this._widget.endpoint;
    this.endpointInfo.provider = this._widget.provider;
    this.endpointMarkdown.markdown = this._widget.endpointMd;
    this.bondForm.curve = this._widget.curve;
    this.bondForm.dotsIssued = this._widget.dotsIssued;
    this.message.message = this._widget.message;
  }

  set userInfo(userInfo: UserInfo) {
    console.log('userInfo', userInfo);
    if (this._userInfo === userInfo) return;
    this._userInfo = userInfo;
    this.bondForm.subscriber = this._userInfo ? this._userInfo.subscriber : null;
    this.userInfoElement.userInfo = this._userInfo;
  }

  destroy() {
    this.unsubscribe();
    this.userInfoElement.destroy();
    this.message.destroy();
    this.chart.destroy();
    this.endpointInfo.destroy();
    this.endpointMarkdown.destroy();
    this.bondForm.destroy();
    this.container.removeChild(this.el);
  }
}

export function createProvider(container: HTMLElement, store: Store, providerAddress: string, endpoint: string) {
  const widgetID = providerAddress + endpoint;
  const provider = new Provider(container, endpoint, providerAddress, widgetID, store.dispatch);
  provider.unsubscribe = store.subscribe(() => {
    const { widgets, userInfo } = store.getState() as State;
    const widget = widgets.find(widget => widget.id === widgetID);
    provider.widget = widget;
    provider.userInfo = userInfo;
  });
  return provider;
}